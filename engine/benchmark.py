"""Pipeline benchmarking utility."""
import time

def run_benchmark(runner, corpus: list):
    start = time.time()
    for text in corpus:
        runner.run(text)
    duration = time.time() - start
    return {"total_items": len(corpus), "total_duration_sec": duration}
