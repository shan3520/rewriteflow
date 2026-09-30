"""Machine-readable run report (written with `run --report file.json`)."""
import json
import platform
import sys
import time
from typing import Dict, List

from engine import __version__
from engine.audit.logger import ContentAuditLogger


def estimate_tokens(text: str) -> int:
    """About 4 characters per token for Llama-family tokenizers."""
    return (len(text) + 3) // 4


class RunLog:
    def __init__(self, source: Dict):
        self.started = time.time()
        self.source = source
        self.files: List[Dict] = []

    def add(self, result: Dict):
        entry = {k: result[k] for k in ("source", "output_path", "status") if k in result}
        if result["status"] == "ok":
            entry.update({
                "seconds": result["seconds"],
                "paragraphs": result["paragraphs"],
                "estimated_tokens": estimate_tokens(result["input_text"]) + estimate_tokens(result["output"]),
                "audit": ContentAuditLogger.create_audit_record(result["input_text"], result["output"]),
                "report": result["report"],
            })
        else:
            entry["error"] = result.get("error")
        self.files.append(entry)

    def to_dict(self) -> Dict:
        return {
            "engine_version": __version__,
            "python": sys.version.split()[0],
            "platform": platform.platform(),
            "started_at": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime(self.started)),
            "seconds": round(time.time() - self.started, 2),
            "source": self.source,
            "files": self.files,
            "summary": {
                "ok": sum(1 for f in self.files if f["status"] == "ok"),
                "failed": sum(1 for f in self.files if f["status"] != "ok"),
                "details_to_check": sum(f.get("report", {}).get("issues", 0) for f in self.files),
            },
        }

    def write(self, path: str):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)
            f.write("\n")


def get_telemetry_report() -> Dict:
    return {"python_version": sys.version, "platform": platform.platform(), "engine_version": __version__}
