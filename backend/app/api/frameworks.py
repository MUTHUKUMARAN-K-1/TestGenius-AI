"""
TestGenius AI — Supported Frameworks Endpoint
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["frameworks"])

SUPPORTED_FRAMEWORKS = {
    "python": [
        {"id": "pytest", "name": "pytest", "description": "Python testing framework (recommended)", "test_types": ["unit", "integration", "edge_case", "security"]},
        {"id": "unittest", "name": "unittest", "description": "Python standard library testing", "test_types": ["unit", "integration"]},
    ],
    "javascript": [
        {"id": "jest", "name": "Jest", "description": "JavaScript testing framework by Meta", "test_types": ["unit", "integration", "edge_case"]},
        {"id": "mocha", "name": "Mocha + Chai", "description": "Flexible JS test framework", "test_types": ["unit", "integration"]},
        {"id": "cypress", "name": "Cypress", "description": "E2E testing for web applications", "test_types": ["e2e", "ui", "edge_case"]},
        {"id": "playwright", "name": "Playwright", "description": "Cross-browser E2E testing", "test_types": ["e2e", "ui"]},
    ],
    "typescript": [
        {"id": "jest", "name": "Jest + ts-jest", "description": "Jest with TypeScript support", "test_types": ["unit", "integration", "edge_case"]},
        {"id": "vitest", "name": "Vitest", "description": "Vite-native testing framework", "test_types": ["unit", "integration"]},
        {"id": "playwright", "name": "Playwright", "description": "E2E with TypeScript", "test_types": ["e2e", "ui"]},
    ],
    "go": [
        {"id": "go_testing", "name": "Go testing", "description": "Go standard library testing", "test_types": ["unit", "integration"]},
    ],
    "java": [
        {"id": "junit", "name": "JUnit 5", "description": "Java testing framework", "test_types": ["unit", "integration"]},
    ],
}

TEST_TYPES = [
    {"id": "unit", "name": "Unit Tests", "description": "Test individual functions/methods in isolation", "icon": "🟢"},
    {"id": "integration", "name": "Integration Tests", "description": "Test API endpoints and service interactions", "icon": "🔵"},
    {"id": "edge_case", "name": "Edge Case Tests", "description": "Boundary values, null inputs, concurrent access", "icon": "🟡"},
    {"id": "security", "name": "Security Tests", "description": "SQL injection, XSS, auth bypass attempts", "icon": "🔴"},
    {"id": "e2e", "name": "E2E Tests", "description": "Full user journey through the application", "icon": "🟣"},
    {"id": "ui", "name": "UI Tests", "description": "Form validation, responsive design, error states", "icon": "⚪"},
]


@router.get("/frameworks", summary="List supported test frameworks")
async def list_frameworks():
    return {"frameworks": SUPPORTED_FRAMEWORKS, "test_types": TEST_TYPES}


@router.get("/languages", summary="List supported languages")
async def list_languages():
    return {"languages": list(SUPPORTED_FRAMEWORKS.keys())}
