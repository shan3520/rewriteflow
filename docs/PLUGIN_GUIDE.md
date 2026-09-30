# CLI plugins

A plugin is your own post-processing node: deterministic Python that runs on each rewritten document after the model.

```python
# british.py
from engine.nodes.base import BaseNode, NodeResult

class BritishSpelling(BaseNode):
    def __init__(self, config=None):
        super().__init__("BritishSpelling", config)

    def execute(self, text, context):
        # context.original_text is the input; context.history has earlier steps
        return NodeResult(text.replace("color", "colour"), {"note": "optional metadata"})
```

```bash
python -m engine run --workflow email_polish --plugin ./british.py:BritishSpelling --post BritishSpelling draft.md
```

A workflow file can list it under `post:` as well. The name is the class name. A plugin is ordinary Python running with your permissions, so only load files you trust.
