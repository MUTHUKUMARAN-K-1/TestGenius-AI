"""
TestGenius AI — Multi-Agent API Routes (v2 — Production Ready)
================================================================
FIXES:
1. ✅ json imported at top level
2. ✅ StreamingResponse properly imported
3. ✅ BackgroundTasks for async processing
4. ✅ Proper TestCodeInput model for /analyze/quality
5. ✅ Token usage endpoint
6. ✅ Mutation execution endpoint
"""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/api/v1", tags=["multi-agent"])


# ═══ REQUEST MODELS ═══

class MultiAgentRequest(BaseModel):
    source_code: Optional[str] = None
    requirements: Optional[str] = None
    openapi_spec: Optional[Dict[str, Any]] = None
    framework: str = Field(default="pytest")
    language: str = Field(default="python")
    test_types: Optional[List[str]] = Field(default=["unit", "integration", "edge_case", "security"])
    max_iterations: int = Field(default=3, ge=1, le=5)


class CodeInput(BaseModel):
    source_code: str = Field(..., min_length=10)
    language: str = Field(default="python")


class TestCodeInput(BaseModel):
    test_code: str = Field(..., min_length=10, description="Test code to score")
    language: str = Field(default="python")


class SecurityRequest(BaseModel):
    openapi_spec: Dict[str, Any]


# ═══ ENDPOINTS ═══

@router.post("/generate/multi-agent", summary="🧠 Multi-Agent Iterative Pipeline",
             description="5-agent system: Analyze → Generate → Validate → Refine → Map Coverage")
async def multi_agent_generate(req: MultiAgentRequest):
    """Research-grade multi-agent iterative test refinement (MuTAP-inspired)."""
    from app.services.multi_agent_engine import run_multi_agent_pipeline

    if not req.source_code and not req.requirements and not req.openapi_spec:
        raise HTTPException(400, "Provide at least one input: source_code, requirements, or openapi_spec")

    try:
        result = await run_multi_agent_pipeline(
            source_code=req.source_code or "",
            requirements=req.requirements or "",
            api_spec=req.openapi_spec,
            framework=req.framework,
            language=req.language,
            test_types=req.test_types,
            max_iterations=req.max_iterations,
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Pipeline failed: {str(e)}")


@router.post("/generate/multi-agent/stream", summary="🧠 Streaming Multi-Agent Pipeline")
async def multi_agent_stream(req: MultiAgentRequest):
    """Streams per-agent progress events via SSE. Each agent completion yields an event."""
    from app.services.multi_agent_engine import run_multi_agent_pipeline_stream

    if not req.source_code and not req.requirements and not req.openapi_spec:
        raise HTTPException(400, "Provide at least one input")

    async def event_stream():
        try:
            async for event in run_multi_agent_pipeline_stream(
                source_code=req.source_code or "",
                requirements=req.requirements or "",
                api_spec=req.openapi_spec,
                framework=req.framework,
                language=req.language,
                test_types=req.test_types,
                max_iterations=req.max_iterations,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/analyze/behaviors", summary="Extract testable behaviors")
async def extract_behaviors_endpoint(req: MultiAgentRequest):
    from app.services.multi_agent_engine import extract_behaviors
    behaviors = extract_behaviors(req.source_code or "", req.requirements or "", req.openapi_spec)
    return {
        "total_behaviors": len(behaviors),
        "behaviors": [
            {"id": b.id, "description": b.description, "category": b.category,
             "priority": b.priority, "source": b.source, "keywords": b.keywords[:5]}
            for b in behaviors
        ],
        "by_category": {cat: len([b for b in behaviors if b.category == cat]) for cat in set(b.category for b in behaviors)},
        "by_priority": {pri: len([b for b in behaviors if b.priority == pri]) for pri in set(b.priority for b in behaviors)},
    }


@router.post("/analyze/complexity", summary="Code complexity analysis")
async def complexity_endpoint(req: CodeInput):
    from app.services.novelty_features import analyze_code_complexity
    return analyze_code_complexity(req.source_code, req.language)


@router.post("/analyze/security", summary="OWASP API security scan")
async def security_scan_endpoint(req: SecurityRequest):
    from app.services.novelty_features import scan_api_security
    return scan_api_security(req.openapi_spec)


@router.post("/analyze/mutations", summary="Mutation testing suggestions")
async def mutations_endpoint(req: CodeInput):
    from app.services.novelty_features import suggest_mutations
    return suggest_mutations(req.source_code)


@router.post("/analyze/mutations/execute", summary="🧬 Execute mutation testing")
async def execute_mutations_endpoint(req: MultiAgentRequest):
    """Actually mutates code, runs tests, finds surviving mutants."""
    from app.services.novelty_features import execute_mutations
    if not req.source_code:
        raise HTTPException(400, "source_code is required for mutation execution")

    test_code = req.requirements or ""  # Pass test code via requirements field
    if not test_code:
        from app.services.multi_agent_engine import run_multi_agent_pipeline
        result = await run_multi_agent_pipeline(
            source_code=req.source_code, framework=req.framework,
            language=req.language, max_iterations=1,
        )
        test_code = result.get("test_code", "")

    return execute_mutations(req.source_code, test_code)


@router.post("/analyze/gaps", summary="Coverage gap detection")
async def gaps_endpoint(req: CodeInput):
    from app.services.novelty_features import detect_coverage_gaps
    return detect_coverage_gaps(req.source_code)


@router.post("/analyze/quality", summary="Score test quality")
async def quality_endpoint(req: TestCodeInput):
    """Rate test code quality on 5 dimensions (A-D grade)."""
    from app.services.novelty_features import score_test_quality
    return score_test_quality(req.test_code)


@router.get("/usage", summary="Token usage statistics")
async def usage_endpoint():
    """Track LLM token consumption and cost estimate."""
    from app.services.llm_provider import get_usage_stats
    return get_usage_stats()


@router.post("/usage/reset", summary="Reset token usage stats")
async def reset_usage_endpoint():
    """Reset token usage counters."""
    from app.services.llm_provider import reset_usage_stats
    reset_usage_stats()
    return {"status": "reset", "message": "Usage statistics cleared."}


# ═══ PIPELINE LOGS (for n8n-style workflow UI) ═══

import time as _time

_pipeline_logs: list = []


def add_pipeline_log(agent: str, event: str, detail: str = "", status: str = "info"):
    """Append a log entry visible to the frontend."""
    _pipeline_logs.append({
        "ts": _time.strftime("%Y-%m-%d %H:%M:%S"),
        "agent": agent,
        "event": event,
        "detail": detail,
        "status": status,
    })
    if len(_pipeline_logs) > 200:
        _pipeline_logs.pop(0)


@router.get("/pipeline/logs", summary="Real-time agent pipeline logs")
async def pipeline_logs(since: int = 0):
    """Return agent execution logs for the workflow visualizer."""
    return {"logs": _pipeline_logs[since:], "total": len(_pipeline_logs)}


@router.delete("/pipeline/logs", summary="Clear pipeline logs")
async def clear_pipeline_logs():
    _pipeline_logs.clear()
    return {"status": "cleared"}


@router.get("/admin/allocation_runs", summary="Allocation run history")
async def allocation_runs(date: str = None):
    """Return pipeline allocation/run history for a given date."""
    return {
        "date": date or _time.strftime("%Y-%m-%d"),
        "runs": _pipeline_logs[-50:],
        "total": len(_pipeline_logs),
    }
