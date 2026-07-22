"""Redis task queue worker runner."""
import time
from typing import Callable, Dict, Any

class BackgroundWorker:
    def __init__(self, queue_name: str = "rewrite_jobs"):
        self.queue_name = queue_name
        self.running = False

    def start(self, handler: Callable[[Dict[str, Any]], None]):
        self.running = True
        print(f"Worker started listening on queue: {self.queue_name}")

    def stop(self):
        self.running = False
