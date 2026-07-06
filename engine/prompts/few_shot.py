"""Few-shot example manager for LLM prompts."""
from typing import List, Dict

class FewShotPromptManager:
    def __init__(self):
        self.examples: List[Dict[str, str]] = []

    def add_example(self, input_text: str, target_output: str):
        self.examples.append({"input": input_text, "output": target_output})

    def format_examples(self) -> str:
        lines = []
        for i, ex in enumerate(self.examples, 1):
            lines.append(f"Example {i}:\nInput: {ex['input']}\nOutput: {ex['output']}\n")
        return "\n".join(lines)
