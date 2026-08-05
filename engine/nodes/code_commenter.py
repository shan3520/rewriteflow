"""Code commenter transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

class CodeCommenterNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("CodeCommenterNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        lines = text.split('\n')
        commented_lines = []
        for line in lines:
            if line.strip().startswith("def ") and not '"""' in line:
                func_name = re.findall(r'def\s+(\w+)', line)
                name_str = func_name[0] if func_name else "function"
                commented_lines.append(f'    """Docstring for {name_str}."""')
            commented_lines.append(line)
        return NodeResult("\n".join(commented_lines), {"code_comments_added": True})
