"""Script execution sandbox."""
class ScriptSandbox:
    @staticmethod
    def execute_transform(code: str, text: str) -> str:
        local_scope = {"input_text": text, "output_text": text}
        exec(code, {}, local_scope)
        return local_scope.get("output_text", text)
