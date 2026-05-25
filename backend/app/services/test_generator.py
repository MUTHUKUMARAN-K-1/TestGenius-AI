"""
TestGenius AI — Test Generator Service
========================================
Core service that generates test cases using LLM with structured prompts.
Supports: unit tests, integration tests, edge cases, security tests, E2E tests.
"""

import json
import uuid
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.services.llm_provider import generate_with_llm
from app.services.prompt_builder import (
    build_requirements_prompt,
    build_api_spec_prompt,
    build_code_analysis_prompt,
    build_frontend_flow_prompt,
    SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)


# ─── Test Generation from Requirements ────────────────────────────────────────

async def generate_from_requirements(
    requirements: str,
    framework: str = "pytest",
    language: str = "python",
    test_types: List[str] = None,
) -> Dict[str, Any]:
    """Generate test cases from product requirements text."""
    start_time = time.time()
    test_types = test_types or ["unit", "integration", "edge_case"]

    prompt = build_requirements_prompt(requirements, framework, language, test_types)
    raw_response = await generate_with_llm(prompt, SYSTEM_PROMPT)

    tests = _parse_test_response(raw_response, framework, language)
    processing_time = (time.time() - start_time) * 1000

    return {
        "test_suite_id": f"TS-{uuid.uuid4().hex[:8]}",
        "source": "requirements",
        "tests_generated": sum(len(t.get("tests", [])) for t in tests) if isinstance(tests, list) else len(tests),
        "test_files": tests,
        "coverage_summary": _build_coverage_summary(tests, test_types),
        "processing_time_ms": round(processing_time, 1),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─── Test Generation from API Spec ───────────────────────────────────────────

async def generate_from_api_spec(
    openapi_spec: Dict[str, Any],
    framework: str = "pytest",
    language: str = "python",
    test_types: List[str] = None,
) -> Dict[str, Any]:
    """Generate test cases from OpenAPI/Swagger specification."""
    start_time = time.time()
    test_types = test_types or ["integration", "edge_case", "security"]

    # Extract endpoints info
    endpoints = _extract_endpoints(openapi_spec)

    prompt = build_api_spec_prompt(openapi_spec, endpoints, framework, language, test_types)
    raw_response = await generate_with_llm(prompt, SYSTEM_PROMPT)

    tests = _parse_test_response(raw_response, framework, language)
    processing_time = (time.time() - start_time) * 1000

    return {
        "test_suite_id": f"TS-{uuid.uuid4().hex[:8]}",
        "source": "api_spec",
        "endpoints_analyzed": len(endpoints),
        "tests_generated": sum(len(t.get("tests", [])) for t in tests) if isinstance(tests, list) else len(tests),
        "test_files": tests,
        "coverage_summary": _build_coverage_summary(tests, test_types),
        "endpoints_detail": endpoints,
        "processing_time_ms": round(processing_time, 1),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─── Test Generation from Source Code ─────────────────────────────────────────

async def generate_from_code(
    source_code: str,
    filename: str = "source.py",
    framework: str = "pytest",
    language: str = "python",
    test_types: List[str] = None,
) -> Dict[str, Any]:
    """Generate unit tests from source code."""
    start_time = time.time()
    test_types = test_types or ["unit", "edge_case"]

    prompt = build_code_analysis_prompt(source_code, filename, framework, language, test_types)
    raw_response = await generate_with_llm(prompt, SYSTEM_PROMPT)

    tests = _parse_test_response(raw_response, framework, language)
    processing_time = (time.time() - start_time) * 1000

    return {
        "test_suite_id": f"TS-{uuid.uuid4().hex[:8]}",
        "source": "code",
        "source_file": filename,
        "tests_generated": sum(len(t.get("tests", [])) for t in tests) if isinstance(tests, list) else len(tests),
        "test_files": tests,
        "coverage_summary": _build_coverage_summary(tests, test_types),
        "processing_time_ms": round(processing_time, 1),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─── Test Generation from Frontend Flow ──────────────────────────────────────

async def generate_from_flow(
    flow_description: str,
    framework: str = "cypress",
    language: str = "javascript",
    test_types: List[str] = None,
) -> Dict[str, Any]:
    """Generate E2E tests from frontend flow description."""
    start_time = time.time()
    test_types = test_types or ["e2e", "ui", "edge_case"]

    prompt = build_frontend_flow_prompt(flow_description, framework, language, test_types)
    raw_response = await generate_with_llm(prompt, SYSTEM_PROMPT)

    tests = _parse_test_response(raw_response, framework, language)
    processing_time = (time.time() - start_time) * 1000

    return {
        "test_suite_id": f"TS-{uuid.uuid4().hex[:8]}",
        "source": "frontend_flow",
        "tests_generated": sum(len(t.get("tests", [])) for t in tests) if isinstance(tests, list) else len(tests),
        "test_files": tests,
        "coverage_summary": _build_coverage_summary(tests, test_types),
        "processing_time_ms": round(processing_time, 1),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _extract_endpoints(spec: Dict) -> List[Dict]:
    """Extract endpoint information from OpenAPI spec."""
    endpoints = []
    paths = spec.get("paths", {})

    for path, methods in paths.items():
        for method, details in methods.items():
            if method in ("get", "post", "put", "patch", "delete"):
                endpoints.append({
                    "method": method.upper(),
                    "path": path,
                    "summary": details.get("summary", ""),
                    "parameters": details.get("parameters", []),
                    "request_body": details.get("requestBody", {}),
                    "responses": details.get("responses", {}),
                    "security": details.get("security", []),
                    "tags": details.get("tags", []),
                })

    return endpoints


def _parse_test_response(raw: str, framework: str, language: str) -> List[Dict]:
    """Parse LLM response into structured test files."""
    import re as _re
    ext = ".py" if language == "python" else ".js" if language in ("javascript", "typescript") else ".go"

    # Split on code fences, capturing optional language tag
    blocks = _re.split(r'```(?:\w+)?', raw)
    # Odd-indexed slices are inside code blocks
    code_blocks = [b.strip() for i, b in enumerate(blocks) if i % 2 == 1 and b.strip()]

    if not code_blocks:
        code_blocks = [raw.strip()] if raw.strip() else []

    # Extract filename hints from the prose before each block
    # Re-split including the text before each block
    prose_blocks = [b for i, b in enumerate(blocks) if i % 2 == 0]

    files = []
    for i, code in enumerate(code_blocks):
        if len(code) < 10:
            continue

        # Look for "# File: ..." or "### test_foo.py" in preceding prose
        filename = None
        if i < len(prose_blocks):
            prose = prose_blocks[i]
            m = _re.search(r'(?:#\s*File:\s*|###?\s+)(test[\w./\-]+\.\w+)', prose, _re.IGNORECASE)
            if m:
                filename = m.group(1).strip()

        if filename is None:
            # Try the first comment line inside the block
            m = _re.match(r'#\s*(test[\w./\-]+\.\w+)', code.split('\n')[0])
            if m:
                filename = m.group(1).strip()

        if filename is None:
            filename = f"test_generated_{i + 1}{ext}" if i > 0 else f"test_generated{ext}"

        files.append({
            "filename": filename,
            "framework": framework,
            "language": language,
            "code": code,
            "num_tests": code.count("def test_") + code.count("it(") + len(_re.findall(r'\btest\s*\(', code)),
        })

    return files


def _build_coverage_summary(tests: List[Dict], test_types: List[str]) -> Dict:
    """Build a coverage summary from generated tests."""
    total_tests = sum(t.get("num_tests", 0) for t in tests)
    return {
        "total_test_files": len(tests),
        "total_tests": total_tests,
        "test_types_requested": test_types,
        "frameworks_used": list(set(t.get("framework", "") for t in tests)),
    }
