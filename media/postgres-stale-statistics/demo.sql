\set ON_ERROR_STOP on
CREATE TABLE canary_demo (label text) WITH (autovacuum_enabled = false);
INSERT INTO canary_demo SELECT CASE WHEN i <= 80 THEN 'SYNTHETIC_CANARY' ELSE 'ordinary' END FROM generate_series(1,100) AS s(i);
ANALYZE canary_demo;
SELECT 'before_update' AS stage, count(*) FILTER (WHERE label = 'SYNTHETIC_CANARY') AS canary_rows FROM canary_demo;
SELECT 'before_update' AS stage, most_common_vals::text, most_common_freqs FROM pg_stats WHERE schemaname='public' AND tablename='canary_demo' AND attname='label';
UPDATE canary_demo SET label='masked';
SELECT 'after_update' AS stage, count(*) FILTER (WHERE label = 'SYNTHETIC_CANARY') AS canary_rows FROM canary_demo;
SELECT 'after_update' AS stage, most_common_vals::text, most_common_freqs FROM pg_stats WHERE schemaname='public' AND tablename='canary_demo' AND attname='label';
ANALYZE canary_demo;
SELECT 'after_analyze' AS stage, count(*) FILTER (WHERE label = 'SYNTHETIC_CANARY') AS canary_rows FROM canary_demo;
SELECT 'after_analyze' AS stage, most_common_vals::text, most_common_freqs FROM pg_stats WHERE schemaname='public' AND tablename='canary_demo' AND attname='label';
