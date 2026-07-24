"""Audit logging for tracking input/output hashes."""
import hashlib
import time

class ContentAuditLogger:
    @staticmethod
    def create_audit_record(input_text: str, output_text: str) -> dict:
        in_hash = hashlib.sha256(input_text.encode()).hexdigest()
        out_hash = hashlib.sha256(output_text.encode()).hexdigest()
        return {
            "timestamp": time.time(),
            "input_hash": in_hash,
            "output_hash": out_hash
        }
