"""Local MQTT 3.1.1 crash/reconnect exercise. No external broker or data."""
import asyncio
import json
import logging
import os
from pathlib import Path
import sqlite3
import sys
import tempfile
import time

PORT = 18884
EVENT = {'producer':'sensor-demo', 'event_id':'batch-42', 'delta':1}

def worker(mode, phase, directory):
    import paho.mqtt.client as mqtt
    root = Path(directory)
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id='worker-'+mode,
                         clean_session=False, manual_ack=True)
    def connected(c, userdata, flags, reason, properties):
        assert not reason.is_failure
        (root/(phase+'-connection.json')).write_text(json.dumps({'session_present':flags.session_present}))
        if phase == 'first':
            c.subscribe('demo/'+mode, qos=1)
        else:
            (root/(phase+'.ready')).touch()
    def subscribed(c, userdata, mid, reasons, properties):
        assert all(not r.is_failure for r in reasons)
        (root/(phase+'.ready')).touch()
    def received(c, userdata, message):
        event = json.loads(message.payload)
        db = sqlite3.connect(root/'state.sqlite')
        with db:
            db.execute('CREATE TABLE IF NOT EXISTS counter(value INTEGER NOT NULL)')
            if not db.execute('SELECT COUNT(*) FROM counter').fetchone()[0]:
                db.execute('INSERT INTO counter VALUES (0)')
            db.execute('CREATE TABLE IF NOT EXISTS applied(producer TEXT, event_id TEXT, PRIMARY KEY(producer,event_id))')
            apply = True
            if mode == 'dedupe':
                apply = db.execute('INSERT OR IGNORE INTO applied VALUES (?,?)',
                                   (event['producer'], event['event_id'])).rowcount == 1
            if apply:
                db.execute('UPDATE counter SET value=value+?', (event['delta'],))
        db.close()
        (root/(phase+'-delivery.json')).write_text(json.dumps({'dup':message.dup,'mid':message.mid,'applied':apply,'qos':message.qos}))
        if phase == 'first':
            os._exit(73)  # Commit happened. PUBACK has deliberately not happened.
        assert c.ack(message.mid, message.qos) == mqtt.MQTT_ERR_SUCCESS
        (root/'second.done').touch()
    client.on_connect = connected
    client.on_subscribe = subscribed
    client.on_message = received
    client.connect('127.0.0.1', PORT)
    deadline = time.monotonic()+12
    while time.monotonic() < deadline:
        client.loop(timeout=.1)
        if (root/'second.done').exists():
            client.disconnect()
            client.loop(timeout=.1)
            return
    raise TimeoutError('Worker did not finish')

def publish(mode):
    import paho.mqtt.client as mqtt
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.connect('127.0.0.1', PORT)
    client.loop_start()
    info = client.publish('demo/'+mode, json.dumps(EVENT), qos=1)
    info.wait_for_publish(timeout=5)
    assert info.is_published()
    client.disconnect()
    client.loop_stop()

async def wait_file(path, proc):
    for _ in range(300):
        if path.exists():
            return
        if proc.returncode is not None:
            raise RuntimeError(f'Worker exited early: {proc.returncode}')
        await asyncio.sleep(.02)
    raise TimeoutError(str(path.name))

async def main():
    import shutil
    broker_binary = os.environ.get('MQTT_BROKER_BINARY') or shutil.which('mosquitto')
    if not broker_binary:
        raise RuntimeError('Install Mosquitto and put its executable on PATH')
    config = Path('local-broker.conf')
    config.write_text(f'listener {PORT} 127.0.0.1\nallow_anonymous true\npersistence false\n')
    log = open('broker.log', 'w')
    broker = await asyncio.create_subprocess_exec(broker_binary,'-c',str(config),'-v',stdout=log,stderr=log)
    for _ in range(100):
        try:
            reader, writer = await asyncio.open_connection('127.0.0.1', PORT)
            writer.close()
            await writer.wait_closed()
            break
        except OSError:
            await asyncio.sleep(.02)
    else:
        raise TimeoutError('Local broker did not start')
    results = []
    try:
        for mode in ['blind', 'dedupe']:
            with tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                first = await asyncio.create_subprocess_exec(sys.executable,__file__,'worker',mode,'first',directory)
                await wait_file(root/'first.ready',first)
                await asyncio.to_thread(publish,mode)
                assert await asyncio.wait_for(first.wait(),8) == 73
                second = await asyncio.create_subprocess_exec(sys.executable,__file__,'worker',mode,'second',directory)
                await wait_file(root/'second.done',second)
                assert await asyncio.wait_for(second.wait(),8) == 0
                with sqlite3.connect(root/'state.sqlite') as db:
                    count = db.execute('SELECT value FROM counter').fetchone()[0]
                    ledger = db.execute('SELECT COUNT(*) FROM applied').fetchone()[0]
                result = {'mode':mode,'counter':count,'ledger_rows':ledger,
                          'first':json.loads((root/'first-delivery.json').read_text()),
                          'second':json.loads((root/'second-delivery.json').read_text()),
                          'reconnect':json.loads((root/'second-connection.json').read_text())}
                assert result['reconnect']['session_present']
                assert result['second']['dup'] and result['second']['qos'] == 1
                assert count == (2 if mode == 'blind' else 1)
                results.append(result)
    finally:
        broker.terminate()
        await asyncio.wait_for(broker.wait(),5)
        log.close()
    Path('mqtt-results.json').write_text(json.dumps(results,indent=2)+'\n')
    print(json.dumps(results,indent=2))

if __name__ == '__main__':
    if len(sys.argv) > 1:
        worker(*sys.argv[2:])
    else:
        asyncio.run(main())
