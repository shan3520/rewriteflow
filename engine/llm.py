"""Minimal Groq chat-completions client (OpenAI-compatible HTTP API, stdlib only)."""
import json
import os
import time
import urllib.error
import urllib.request
from typing import Callable, Optional

DEFAULT_MODEL = "llama-3.3-70b-versatile"
# Host root, as with the groq-sdk used by the backend; the API path is appended.
DEFAULT_BASE_URL = "https://api.groq.com"


class LLMError(RuntimeError):
    def __init__(self, message: str, status: Optional[int] = None):
        super().__init__(message)
        self.status = status


class GroqClient:
    """complete(system, text) -> str, retrying rate-limited calls with backoff."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: float = 0.7,
        timeout: float = 60,
        max_attempts: int = 3,
        backoff: float = 1.0,
        sleep: Callable[[float], None] = time.sleep,
        opener: Callable = urllib.request.urlopen,
    ):
        self.api_key = api_key if api_key is not None else os.environ.get("GROQ_API_KEY", "")
        self.model = model or os.environ.get("GROQ_MODEL") or DEFAULT_MODEL
        self.base_url = (base_url or os.environ.get("GROQ_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self.temperature = temperature
        self.timeout = timeout
        self.max_attempts = max_attempts
        self.backoff = backoff
        self.sleep = sleep
        self.opener = opener

    def _request(self, system: str, text: str) -> str:
        body = json.dumps({
            "model": self.model,
            "temperature": self.temperature,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": text}],
        }).encode()
        req = urllib.request.Request(
            f"{self.base_url}/openai/v1/chat/completions",
            data=body,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with self.opener(req, timeout=self.timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
        return content.strip() or text

    def complete(self, system: str, text: str) -> str:
        if not self.api_key:
            raise LLMError("GROQ_API_KEY is not set. Get a key at https://console.groq.com and export it.")
        attempts = 0
        while True:
            try:
                return self._request(system, text)
            except urllib.error.HTTPError as err:
                attempts += 1
                if err.code == 429 and attempts < self.max_attempts:
                    retry_after = err.headers.get("Retry-After") if err.headers else None
                    delay = float(retry_after) if retry_after and retry_after.replace(".", "", 1).isdigit() else self.backoff * 2 ** attempts
                    self.sleep(delay)
                    continue
                kind = {429: "Rate limit exceeded", 401: "Groq API key invalid"}.get(err.code, "AI processing error")
                raise LLMError(f"{kind} (HTTP {err.code}) after {attempts} attempt(s)", err.code) from err
            except urllib.error.URLError as err:
                raise LLMError(f"Could not reach {self.base_url}: {err.reason}") from err
