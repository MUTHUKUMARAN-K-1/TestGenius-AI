"""
TestGenius AI — Prompt Builder
================================
Builds structured, context-rich prompts for the LLM to generate high-quality test cases.
Each prompt type is tailored to the input source (requirements, API spec, code, flow).
"""

import json
from typing import Dict, List, Any


SYSTEM_PROMPT = """You are TestGenius, an expert QA engineer and test automation specialist with 15 years of experience.
Your task is to generate comprehensive, production-ready test cases.

RULES:
1. Generate REAL, RUNNABLE test code — not pseudocode or descriptions.
2. Include ALL necessary imports at the top of each file.
3. Use proper test naming: test_<what>_<scenario>_<expected_result>
4. Cover: happy path, edge cases, boundary values, error scenarios, security.
5. Add docstrings explaining WHAT each test verifies and WHY it matters.
6. Use proper assertions (not just print statements).
7. Include setup/teardown fixtures where appropriate.
8. Generate at least 8-15 test cases per input.
9. Group tests logically into test classes or describe blocks.
10. For API tests: include request headers, auth tokens, proper status code checks.
11. For edge cases: test null/empty inputs, max lengths, special characters, concurrent access.
12. For security: test SQL injection, XSS, auth bypass, IDOR.

OUTPUT FORMAT:
- Wrap each test file in a markdown code block with the language specified.
- Start each file with a comment: # File: <filename>
- Separate multiple files clearly.
"""


def build_requirements_prompt(requirements: str, framework: str, language: str, test_types: List[str]) -> str:
    """Build prompt for generating tests from product requirements."""
    return f"""Analyze the following product requirements and generate comprehensive test cases.

## Product Requirements:
{requirements}

## Generation Config:
- Test framework: {framework}
- Language: {language}
- Test types to generate: {', '.join(test_types)}

## Instructions:
1. Extract all testable features and user stories from the requirements.
2. For each feature, generate:
   - Happy path tests (normal usage)
   - Edge case tests (boundary values, empty inputs, special chars)
   - Negative tests (invalid inputs, unauthorized access)
   - Integration tests (feature interactions)
3. Name tests descriptively: test_<feature>_<scenario>_<expected_behavior>
4. Include proper setup fixtures for any required state.
5. Add assertions that verify BOTH success AND failure conditions.

Generate the complete test file(s) now:"""


def build_api_spec_prompt(spec: Dict, endpoints: List[Dict], framework: str, language: str, test_types: List[str]) -> str:
    """Build prompt for generating tests from OpenAPI specification."""

    # Summarize endpoints
    endpoint_summary = ""
    for ep in endpoints[:20]:  # Limit to prevent token overflow
        endpoint_summary += f"\n- {ep['method']} {ep['path']}: {ep.get('summary', 'No description')}"
        if ep.get('parameters'):
            params = [p.get('name', '') for p in ep['parameters'][:5]]
            endpoint_summary += f"\n  Parameters: {', '.join(params)}"
        if ep.get('request_body'):
            endpoint_summary += f"\n  Has request body: Yes"
        if ep.get('responses'):
            codes = list(ep['responses'].keys())[:4]
            endpoint_summary += f"\n  Response codes: {', '.join(codes)}"

    # Include schemas if available
    schemas_str = ""
    schemas = spec.get("components", {}).get("schemas", {})
    if schemas:
        schema_names = list(schemas.keys())[:10]
        schemas_str = f"\n\nData Models: {', '.join(schema_names)}"
        for name in schema_names[:5]:
            props = schemas[name].get("properties", {})
            if props:
                schemas_str += f"\n  {name}: {', '.join(list(props.keys())[:8])}"

    servers = spec.get('servers') or []
    base_url = servers[0].get('url', 'http://localhost:8000') if servers else 'http://localhost:8000'

    return f"""Analyze this API specification and generate comprehensive API test cases.

## API Info:
- Title: {spec.get('info', {}).get('title', 'Unknown API')}
- Version: {spec.get('info', {}).get('version', '1.0')}
- Base URL: {base_url}

## Endpoints:{endpoint_summary}
{schemas_str}

## Security:
{json.dumps(spec.get('components', {}).get('securitySchemes', {}), indent=2)[:500] if spec.get('components', {}).get('securitySchemes') else 'None specified'}

## Generation Config:
- Framework: {framework}
- Language: {language}
- Test types: {', '.join(test_types)}

## Instructions:
1. Generate tests for EACH endpoint listed above.
2. For each endpoint, include:
   - Success case (valid request → expected response)
   - Invalid input (missing required fields, wrong types)
   - Authentication (no token, invalid token, expired token)
   - Edge cases (empty body, max payload size, special characters)
   - Security (SQL injection in parameters, XSS in string fields)
3. Use proper HTTP client (httpx for Python, axios/fetch for JS).
4. Assert response status codes AND response body structure.
5. Include test fixtures for auth tokens and base URL.

Generate the complete test file(s) now:"""


def build_code_analysis_prompt(code: str, filename: str, framework: str, language: str, test_types: List[str]) -> str:
    """Build prompt for generating unit tests from source code."""
    return f"""Analyze this source code and generate comprehensive unit tests.

## Source File: {filename}

```{language}
{code}
```

## Generation Config:
- Framework: {framework}
- Language: {language}
- Test types: {', '.join(test_types)}

## Instructions:
1. Identify ALL functions/methods/classes in the code.
2. For each function, generate tests for:
   - Normal inputs → expected outputs (happy path)
   - Edge cases: empty inputs, None/null, zero, negative numbers, empty strings, empty lists
   - Boundary values: MAX_INT, very long strings, single character
   - Error cases: invalid types, missing arguments
   - If the function has side effects: mock dependencies and verify calls
3. Use proper mocking for external dependencies (databases, APIs, file system).
4. Test both return values AND raised exceptions.
5. Include parameterized tests where appropriate (@pytest.mark.parametrize or test.each).

Generate the complete test file(s) now:"""


def build_frontend_flow_prompt(flow: str, framework: str, language: str, test_types: List[str]) -> str:
    """Build prompt for generating E2E tests from frontend flow description."""
    return f"""Analyze this frontend user flow and generate comprehensive E2E test cases.

## User Flow Description:
{flow}

## Generation Config:
- Framework: {framework}
- Language: {language}
- Test types: {', '.join(test_types)}

## Instructions:
1. Break the flow into discrete user actions (click, type, navigate, submit).
2. For each action, generate tests for:
   - Happy path (user completes flow successfully)
   - Validation errors (required fields empty, invalid formats)
   - Edge cases (special characters, very long inputs, rapid clicking)
   - Error states (network failure, server error, timeout)
   - Accessibility (keyboard navigation, screen reader)
3. Use proper selectors (data-testid preferred, then aria-label, then CSS).
4. Include proper waits (waitForSelector, not arbitrary timeouts).
5. Test responsive behavior if mentioned in the flow.

Generate the complete test file(s) now:"""
