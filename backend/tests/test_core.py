"""
TestGenius AI — Test Suite (Production Ready)
===============================================
Run: cd backend && pytest tests/ -v
"""

import pytest

from app.services.novelty_features import (
    analyze_code_complexity, detect_coverage_gaps,
    score_test_quality, suggest_mutations, execute_mutations, scan_api_security,
)
from app.services.multi_agent_engine import (
    extract_behaviors, validate_test_syntax, map_behavior_coverage_semantic,
)


SAMPLE_CODE = '''
def calculate_discount(price, user_type, coupon=None):
    if price <= 0:
        raise ValueError("Price must be positive")
    discount = 0
    if user_type == "premium":
        discount = 0.2
    elif user_type == "member":
        discount = 0.1
    if coupon and coupon.is_valid():
        discount += coupon.value
    return min(discount, 0.5) * price

def process_order(order_id, items, db_client):
    if not items:
        raise ValueError("Order must have items")
    total = sum(item.price * item.quantity for item in items)
    result = db_client.save_order(order_id, items, total)
    return {"order_id": order_id, "total": total}
'''

SAMPLE_TESTS = '''
import pytest

def test_calculate_discount_premium():
    """Premium users get 20%."""
    result = calculate_discount(100.0, "premium")
    assert result == 20.0
    assert isinstance(result, float)

def test_calculate_discount_raises_on_negative():
    """Negative price raises ValueError."""
    with pytest.raises(ValueError, match="positive"):
        calculate_discount(-10, "standard")

@pytest.mark.parametrize("utype,exp", [("premium", 20.0), ("member", 10.0)])
def test_discount_types(utype, exp):
    """Each type correct."""
    assert calculate_discount(100, utype) == exp
'''

SAMPLE_API = {
    "openapi": "3.0.0", "info": {"title": "API", "version": "1.0"},
    "paths": {
        "/users": {"post": {"summary": "Create", "requestBody": {"content": {"application/json": {"schema": {"properties": {"email": {"type": "string"}, "role": {"type": "string"}}}}}}}},
        "/users/{user_id}": {"get": {"summary": "Get user", "security": [{"bearer": {}}]}, "delete": {"summary": "Delete"}},
    }
}


class TestComplexity:
    def test_detects_functions(self):
        r = analyze_code_complexity(SAMPLE_CODE, "python")
        assert r["total_functions"] >= 2

    def test_computes_grade(self):
        r = analyze_code_complexity(SAMPLE_CODE, "python")
        assert r["grade"] in ("A", "B", "C", "D")

    def test_handles_invalid_code(self):
        r = analyze_code_complexity("def broken(:", "python")
        assert "grade" in r

    def test_suggests_tests(self):
        r = analyze_code_complexity(SAMPLE_CODE, "python")
        assert r["suggested_total_tests"] > 0


class TestGaps:
    def test_finds_error_paths(self):
        r = detect_coverage_gaps(SAMPLE_CODE)
        assert any(g["type"] == "error_path" for g in r["gaps"])

    def test_finds_external_calls(self):
        r = detect_coverage_gaps(SAMPLE_CODE)
        assert any(g["type"] == "external_call" for g in r["gaps"])

    def test_has_coverage_estimate(self):
        r = detect_coverage_gaps(SAMPLE_CODE)
        assert 0 <= r["coverage_estimate"] <= 100


class TestQuality:
    def test_good_tests_score_high(self):
        r = score_test_quality(SAMPLE_TESTS)
        assert r["overall"] >= 40
        assert r["test_count"] >= 3

    def test_empty_scores_low(self):
        r = score_test_quality("# nothing")
        assert r["grade"] == "D"

    def test_all_dimensions_present(self):
        r = score_test_quality(SAMPLE_TESTS)
        for dim in ["assertions", "edge_cases", "error_handling", "isolation", "docs"]:
            assert dim in r["scores"]


class TestMutations:
    def test_finds_mutations(self):
        r = suggest_mutations(SAMPLE_CODE)
        assert r["total_mutations"] > 0

    def test_has_types(self):
        r = suggest_mutations(SAMPLE_CODE)
        assert len(r.get("by_type", {})) > 0

    def test_execute_basic(self):
        src = "def add(a, b): return a + b"
        tests = "def test_add(): assert add(2, 3) == 5"
        r = execute_mutations(src, tests)
        assert "mutation_score" in r
        assert r["total_mutations"] > 0

    def test_strong_tests_kill_more(self):
        src = "def add(a, b): return a + b"
        strong = """
def test_add_basic(): assert add(2, 3) == 5
def test_add_zero(): assert add(0, 0) == 0
def test_add_neg(): assert add(-1, -2) == -3
"""
        r = execute_mutations(src, strong)
        assert r["mutation_score"] >= 30


class TestBehaviors:
    def test_from_code(self):
        b = extract_behaviors(source_code=SAMPLE_CODE)
        assert len(b) >= 5
        cats = set(x.category for x in b)
        assert "happy_path" in cats and "edge_case" in cats

    def test_from_api(self):
        b = extract_behaviors(api_spec=SAMPLE_API)
        assert len(b) >= 5
        assert any(x.category == "security" for x in b)

    def test_keywords_populated(self):
        b = extract_behaviors(source_code=SAMPLE_CODE)
        for item in b:
            assert len(item.keywords) >= 2


class TestSyntax:
    def test_valid_passes(self):
        r = validate_test_syntax(SAMPLE_TESTS, "python")
        assert r["valid"] is True

    def test_invalid_fails(self):
        r = validate_test_syntax("def test(\n  x", "python")
        assert r["valid"] is False

    def test_js_unbalanced_braces(self):
        r = validate_test_syntax("describe('x', () => {", "javascript")
        assert r["valid"] is False


class TestCoverage:
    def test_maps_behaviors(self):
        b = extract_behaviors(source_code=SAMPLE_CODE)
        r = map_behavior_coverage_semantic(b, SAMPLE_TESTS, "python")
        assert r["covered"] > 0
        assert r["coverage_pct"] > 0

    def test_has_categories(self):
        b = extract_behaviors(source_code=SAMPLE_CODE)
        r = map_behavior_coverage_semantic(b, SAMPLE_TESTS, "python")
        assert "by_category" in r


class TestSecurity:
    def test_finds_missing_auth(self):
        r = scan_api_security(SAMPLE_API)
        assert any(f["type"] == "broken_auth" for f in r["findings"])

    def test_finds_idor(self):
        r = scan_api_security(SAMPLE_API)
        assert any(f["type"] == "idor" for f in r["findings"])

    def test_has_score(self):
        r = scan_api_security(SAMPLE_API)
        assert 0 <= r["security_score"] <= 100
        assert r["grade"] in ("A", "B", "C", "F")
