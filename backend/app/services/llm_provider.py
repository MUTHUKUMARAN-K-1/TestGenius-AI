"""
TestGenius AI — Universal LLM Provider (v2 — Production Ready)
================================================================
Works with ANY OpenAI-compatible API.
Features: exponential backoff, streaming, token tracking, proper timeouts.
"""

import os
import time
import json
import logging
import asyncio
import httpx
from typing import Optional, Dict
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")
LLM_MAX_TOKENS = int(os.environ.get("LLM_MAX_TOKENS", "8192"))
LLM_TEMPERATURE = float(os.environ.get("LLM_TEMPERATURE", "0.3"))
LLM_TIMEOUT = float(os.environ.get("LLM_TIMEOUT", "120"))


@dataclass
class UsageStats:
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_requests: int = 0
    total_errors: int = 0
    total_retries: int = 0
    total_latency_ms: float = 0

    @property
    def total_tokens(self) -> int:
        return self.total_prompt_tokens + self.total_completion_tokens

    @property
    def avg_latency_ms(self) -> float:
        return self.total_latency_ms / max(self.total_requests, 1)

    def to_dict(self) -> Dict:
        return {
            "total_prompt_tokens": self.total_prompt_tokens,
            "total_completion_tokens": self.total_completion_tokens,
            "total_tokens": self.total_tokens,
            "total_requests": self.total_requests,
            "total_errors": self.total_errors,
            "total_retries": self.total_retries,
            "avg_latency_ms": round(self.avg_latency_ms, 1),
            "estimated_cost_usd": round(self.total_prompt_tokens * 3e-7 + self.total_completion_tokens * 6e-7, 4),
        }


_usage = UsageStats()


def get_usage_stats() -> Dict:
    return _usage.to_dict()


def reset_usage_stats():
    global _usage
    _usage = UsageStats()


async def generate_with_llm(
    prompt: str,
    system_prompt: str,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    timeout: Optional[float] = None,
) -> str:
    """Generate text with exponential backoff retry."""
    if not LLM_API_KEY:
        raise RuntimeError("LLM_API_KEY not set. Configure in .env")

    url = f"{LLM_BASE_URL.rstrip('/')}/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {LLM_API_KEY}"}

    if "openrouter" in LLM_BASE_URL:
        headers["HTTP-Referer"] = "https://testgenius-ai.app"
        headers["X-Title"] = "TestGenius AI"

    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature if temperature is not None else LLM_TEMPERATURE,
        "max_tokens": max_tokens if max_tokens is not None else LLM_MAX_TOKENS,
    }

    request_timeout = timeout or LLM_TIMEOUT
    start_time = time.time()
    max_retries = 3

    for attempt in range(max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=request_timeout) as client:
                response = await client.post(url, headers=headers, json=payload)

                if response.status_code == 429:
                    _usage.total_retries += 1
                    if attempt < max_retries:
                        wait = (2 ** attempt) + 1
                        retry_after = response.headers.get("Retry-After")
                        if retry_after:
                            try:
                                wait = min(int(retry_after), 30)
                            except ValueError:
                                pass
                        logger.warning(f"Rate limited. Retry {attempt+1}/{max_retries} in {wait}s")
                        await asyncio.sleep(wait)
                        continue
                    _usage.total_errors += 1
                    raise RuntimeError("Rate limited after all retries")

                if response.status_code == 503:
                    _usage.total_retries += 1
                    if attempt < max_retries:
                        await asyncio.sleep((2 ** attempt) + 1)
                        continue

                if response.status_code != 200:
                    _usage.total_errors += 1
                    raise RuntimeError(f"LLM API error {response.status_code}: {response.text[:200]}")

                data = response.json()
                content = data["choices"][0]["message"]["content"]

                usage = data.get("usage", {})
                latency = (time.time() - start_time) * 1000
                _usage.total_prompt_tokens += usage.get("prompt_tokens", 0)
                _usage.total_completion_tokens += usage.get("completion_tokens", 0)
                _usage.total_requests += 1
                _usage.total_latency_ms += latency

                logger.info(f"LLM: {len(content)} chars, {usage.get('total_tokens', '?')} tokens, {latency:.0f}ms")
                return content

        except httpx.TimeoutException:
            _usage.total_retries += 1
            if attempt < max_retries:
                await asyncio.sleep(2 ** attempt)
                continue
            _usage.total_errors += 1
            raise RuntimeError(f"LLM timed out after {max_retries} retries")
        except httpx.ConnectError:
            _usage.total_errors += 1
            raise RuntimeError(f"Cannot connect to LLM at {LLM_BASE_URL}")

    _usage.total_errors += 1
    raise RuntimeError("LLM request failed after all retries")


async def generate_with_llm_streaming(prompt: str, system_prompt: str, temperature: Optional[float] = None, max_tokens: Optional[int] = None):
    """Streaming generation — yields chunks as they arrive."""
    if not LLM_API_KEY:
        raise RuntimeError("LLM_API_KEY not set")

    url = f"{LLM_BASE_URL.rstrip('/')}/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {LLM_API_KEY}"}
    payload = {
        "model": LLM_MODEL,
        "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
        "temperature": temperature if temperature is not None else LLM_TEMPERATURE,
        "max_tokens": max_tokens if max_tokens is not None else LLM_MAX_TOKENS,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            if response.status_code != 200:
                raise RuntimeError(f"Streaming error: {response.status_code}")
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if content:
                            yield content
                    except (json.JSONDecodeError, IndexError, KeyError):
                        continue


def get_provider_info() -> Dict:
    return {
        "configured": bool(LLM_API_KEY),
        "base_url": LLM_BASE_URL,
        "model": LLM_MODEL,
        "max_tokens": LLM_MAX_TOKENS,
        "temperature": LLM_TEMPERATURE,
        "timeout_seconds": LLM_TIMEOUT,
        "provider": _detect_provider(),
        "usage": _usage.to_dict(),
    }


def _detect_provider() -> str:
    url = LLM_BASE_URL.lower()
    providers = [("openai.com", "OpenAI"), ("featherless", "Featherless"), ("groq.com", "Groq"),
                 ("together", "Together.ai"), ("deepseek", "DeepSeek"), ("openrouter", "OpenRouter"),
                 ("mistral", "Mistral"), ("localhost:11434", "Ollama"), ("localhost:1234", "LM Studio"),
                 ("localhost", "Local")]
    for key, name in providers:
        if key in url:
            return name
    return "Custom"
