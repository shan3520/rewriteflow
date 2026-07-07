"""Chain-of-Thought reasoning prompt builder."""
from typing import List

class CoTReasoningBuilder:
    def __init__(self, steps: List[str] = None):
        self.steps = steps or [
            "1. Analyze the original text structure and vocabulary.",
            "2. Identify tone discrepancies or grammatical errors.",
            "3. Formulate improved alternative phrasing.",
            "4. Produce final clean output text."
        ]

    def build_prompt(self, input_text: str) -> str:
        steps_str = "\n".join(self.steps)
        return f"Think step by step:\n{steps_str}\n\nOriginal Text: {input_text}\nTarget Output:"
