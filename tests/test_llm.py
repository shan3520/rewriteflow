"""Groq HTTP client: request shape, retries and errors (no network)."""
import io
import json
import unittest
import urllib.error

from engine.llm import GroqClient, LLMError


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def reply(content):
    return FakeResponse(json.dumps({"choices": [{"message": {"content": content}}]}).encode())


def http_error(code, retry_after=None):
    headers = {"Retry-After": retry_after} if retry_after else {}
    return urllib.error.HTTPError("https://x", code, "err", headers, io.BytesIO(b"{}"))


class TestGroqClient(unittest.TestCase):
    def test_sends_system_and_user_messages(self):
        seen = {}

        def opener(req, timeout):
            seen["url"] = req.full_url
            seen["auth"] = req.headers["Authorization"]
            seen["body"] = json.loads(req.data)
            return reply("  Rewritten.  ")

        client = GroqClient(api_key="k", model="m", base_url="https://api.example/", opener=opener)
        self.assertEqual(client.complete("SYS", "text"), "Rewritten.")
        self.assertEqual(seen["url"], "https://api.example/openai/v1/chat/completions")
        self.assertEqual(seen["auth"], "Bearer k")
        self.assertEqual(seen["body"]["model"], "m")
        self.assertEqual(seen["body"]["messages"], [{"role": "system", "content": "SYS"}, {"role": "user", "content": "text"}])

    def test_retries_rate_limits_honoring_retry_after(self):
        responses = [http_error(429, "3"), http_error(429), reply("ok")]
        sleeps = []

        def opener(req, timeout):
            r = responses.pop(0)
            if isinstance(r, Exception):
                raise r
            return r

        client = GroqClient(api_key="k", opener=opener, sleep=sleeps.append, backoff=1.0)
        self.assertEqual(client.complete("s", "t"), "ok")
        self.assertEqual(sleeps, [3.0, 4.0])

    def test_gives_up_with_readable_errors(self):
        def denied(req, timeout):
            raise http_error(401)

        with self.assertRaisesRegex(LLMError, "API key invalid") as ctx:
            GroqClient(api_key="bad", opener=denied).complete("s", "t")
        self.assertEqual(ctx.exception.status, 401)

        def offline(req, timeout):
            raise urllib.error.URLError("no route")

        with self.assertRaisesRegex(LLMError, "Could not reach"):
            GroqClient(api_key="k", opener=offline).complete("s", "t")

    def test_missing_key(self):
        with self.assertRaisesRegex(LLMError, "GROQ_API_KEY"):
            GroqClient(api_key="").complete("s", "t")

    def test_empty_completion_falls_back_to_input(self):
        self.assertEqual(GroqClient(api_key="k", opener=lambda r, timeout: reply("")).complete("s", "keep me"), "keep me")


if __name__ == "__main__":
    unittest.main()
