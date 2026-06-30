# RewriteFlow Core Pipeline Engine

The `engine` package provides an extensible Python DAG transformation engine designed for text processing.

## Architecture Components

1. **PipelineContext**: Manages text state, execution step history, variables, and log timeline.
2. **BaseNode**: Abstract base class for transformation nodes (`GrammarFixNode`, `ToneShiftNode`, etc.).
3. **PipelineRunner**: Executes a sequence of nodes sequentially or via DAG dependency order.

## Usage Example

```python
from engine.runner import PipelineRunner
from engine.nodes.grammar import GrammarFixNode
from engine.nodes.tone import ToneShiftNode

runner = PipelineRunner([
    GrammarFixNode(),
    ToneShiftNode({"target_tone": "formal"})
])

context = runner.run("i can't help you .")
print(context.text) # "I cannot assist you."
```
