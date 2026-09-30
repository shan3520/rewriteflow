"""Content hashes, so a report can prove which input produced which output."""
import hashlib
import time


class ContentAuditLogger:
    @staticmethod
    def create_audit_record(input_text: str, output_text: str) -> dict:
        return {
            "timestamp": time.time(),
            "input_sha256": hashlib.sha256(input_text.encode()).hexdigest(),
            "output_sha256": hashlib.sha256(output_text.encode()).hexdigest(),
        }
