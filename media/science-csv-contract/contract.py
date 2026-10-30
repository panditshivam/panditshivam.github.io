"""An authored teaching contract, not the ProtoStar submission schema."""
import csv
import io
import json
import math
import re

FIELDS = ["city", "year", "annual_mean_temperature", "unit"]


def validate(text, cutoff=2018):
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != FIELDS:
        return ["header: expected " + ",".join(FIELDS)]
    seen, issues = set(), []
    rows = list(reader)
    if not rows:
        issues.append("dataset: no observations")
    for line, row in enumerate(rows, 2):
        def fail(message):
            issues.append(f"line {line}: {message}")
        if None in row or any(value is None for value in row.values()):
            fail("wrong field count")
            continue
        city = row["city"].strip()
        if not city:
            fail("city is empty")
        year_text = row["year"]
        if not re.fullmatch(r"[0-9]{4}", year_text):
            fail("year must have four digits")
        else:
            year = int(year_text)
            if not 1900 <= year <= cutoff:
                fail(f"year outside training window 1900..{cutoff}")
            key = (city, year)
            if key in seen:
                fail("duplicate city-year")
            seen.add(key)
        if row["unit"] != "degC":
            fail("unit must be degC; no implicit conversion")
        try:
            value = float(row["annual_mean_temperature"])
            if not math.isfinite(value):
                fail("temperature must be finite")
            elif not -60 <= value <= 60:
                fail("temperature outside teaching contract range")
        except ValueError:
            fail("temperature is not numeric")
    return issues


def fixtures():
    header = ",".join(FIELDS) + "\n"
    good = header + "Example City,2017,12.5,degC\nExample City,2018,13.0,degC\n"
    return {
        "valid": good,
        "wrong_unit": good.replace("degC", "degF"),
        "duplicate": good + "Example City,2018,14.0,degC\n",
        "future_training_row": good + "Example City,2019,14.0,degC\n",
        "nonfinite": good.replace("12.5", "NaN"),
        "bad_year": good.replace("2017", "2017.0"),
        "empty": header,
        "extra_column": good.replace("12.5,degC", "12.5,degC,extra"),
    }


if __name__ == "__main__":
    results = {name: validate(text) for name, text in fixtures().items()}
    assert results["valid"] == []
    assert all(results[name] for name in results if name != "valid")
    assert any("duplicate" in x for x in results["duplicate"])
    assert any("window" in x for x in results["future_training_row"])
    print(json.dumps({"synthetic": True, "results": results}, indent=2))
