"""Shared test helpers."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIXTURES = os.path.join(ROOT, "shared", "fixtures")


def fixture(name):
    with open(os.path.join(FIXTURES, name), encoding="utf-8") as f:
        return json.load(f)


class FakeLLM:
    """Records calls; "rewrites" by replacing words from a small table and
    optionally dropping the first percentage, so meaning checks have something to find."""

    def __init__(self, drop_percent=False, fail_on=None):
        self.calls = []
        self.drop_percent = drop_percent
        self.fail_on = fail_on

    def complete(self, system, text):
        self.calls.append((system, text))
        if self.fail_on and self.fail_on in text:
            raise RuntimeError("model unavailable")
        out = text.replace("grew", "increased").replace("big", "large")
        if self.drop_percent:
            import re

            out = re.sub(r"\s\d+%", "", out, count=1)
        return out
