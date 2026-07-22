"""Task Queue Consumer."""
from engine.worker.redis_worker import BackgroundWorker
from engine.runner import PipelineRunner
from engine.nodes.grammar import GrammarFixNode

class TaskQueueConsumer:
    def __init__(self):
        self.worker = BackgroundWorker()

    def process_job(self, payload: dict) -> dict:
        text = payload.get("text", "")
        runner = PipelineRunner([GrammarFixNode()])
        ctx = runner.run(text)
        return {"status": "SUCCESS", "output": ctx.text}
