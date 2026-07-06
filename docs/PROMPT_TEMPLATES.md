# Prompt Templates Architecture

## Variable Interpolation

Templates support `{{ variable_name }}` syntax.

```python
from engine.prompts.template import PromptTemplate

tmpl = PromptTemplate("Rewrite the following text in {{ tone }} tone: {{ text }}")
result = tmpl.render({"tone": "academic", "text": "We found interesting results."})
```
