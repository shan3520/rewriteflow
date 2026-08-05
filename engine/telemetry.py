"""System telemetry module."""
import platform
import sys

def get_telemetry_report():
    return {
        "python_version": sys.version,
        "platform": platform.platform(),
        "engine_version": "1.2.0"
    }
