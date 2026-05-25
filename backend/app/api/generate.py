"""
TestGenius AI — API Routes for Test Generation
"""

import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.test_generator import (
    generate_from_requirements,
    generate_from_api_spec,
    generate_from_code,
    generate_from_flow,
)
from app.services.llm_provider import get_provider_info

router = APIRouter(prefix="/api/v1", tags=["test-generation"])


# ═══ REQUEST MODELS ═══

class RequirementsRequest(BaseModel):
    requirements: str = Field(..., min_length=20, description="Product requirements text")
    framework: str = Field(default="pytest", description="Test framework")
    language: str = Field(default="python", description="Programming language")
    test_types: Optional[List[str]] = Field(default=["unit", "integration", "edge_case"])

class ApiSpecRequest(BaseModel):
    openapi_spec: Dict[str, Any] = Field(..., description="OpenAPI/Swagger JSON spec")
    framework: str = Field(default="pytest")
    language: str = Field(default="python")
    test_types: Optional[List[str]] = Field(default=["integration", "edge_case", "security"])

class CodeRequest(BaseModel):
    source_code: str = Field(..., min_length=10, description="Source code to test")
    filename: str = Field(default="source.py")
    framework: str = Field(default="pytest")
    language: str = Field(default="python")
    test_types: Optional[List[str]] = Field(default=["unit", "edge_case"])

class FlowRequest(BaseModel):
    flow_description: str = Field(..., min_length=20, description="Frontend flow description")
    framework: str = Field(default="cypress")
    language: str = Field(default="javascript")
    test_types: Optional[List[str]] = Field(default=["e2e", "ui", "edge_case"])

class UnifiedRequest(BaseModel):
    requirements: Optional[str] = None
    openapi_spec: Optional[Dict[str, Any]] = None
    source_code: Optional[str] = None
    flow_description: Optional[str] = None
    framework: str = Field(default="pytest")
    language: str = Field(default="python")
    test_types: Optional[List[str]] = Field(default=["unit", "integration", "edge_case", "security"])


# ═══ ENDPOINTS ═══

@router.post("/generate/from-requirements", summary="Generate tests from product requirements")
async def from_requirements(req: RequirementsRequest):
    try:
        result = await generate_from_requirements(
            requirements=req.requirements,
            framework=req.framework,
            language=req.language,
            test_types=req.test_types,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/from-api-spec", summary="Generate tests from OpenAPI/Swagger spec")
async def from_api_spec(req: ApiSpecRequest):
    try:
        result = await generate_from_api_spec(
            openapi_spec=req.openapi_spec,
            framework=req.framework,
            language=req.language,
            test_types=req.test_types,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/from-code", summary="Generate unit tests from source code")
async def from_code(req: CodeRequest):
    try:
        result = await generate_from_code(
            source_code=req.source_code,
            filename=req.filename,
            framework=req.framework,
            language=req.language,
            test_types=req.test_types,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/from-flow", summary="Generate E2E tests from frontend flow")
async def from_flow(req: FlowRequest):
    try:
        result = await generate_from_flow(
            flow_description=req.flow_description,
            framework=req.framework,
            language=req.language,
            test_types=req.test_types,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/unified", summary="All-in-one: multiple inputs → full test suite")
async def unified(req: UnifiedRequest):
    try:
        tasks = []
        if req.requirements:
            tasks.append(generate_from_requirements(req.requirements, req.framework, req.language, req.test_types))
        if req.openapi_spec:
            tasks.append(generate_from_api_spec(req.openapi_spec, req.framework, req.language, req.test_types))
        if req.source_code:
            tasks.append(generate_from_code(req.source_code, "source.py", req.framework, req.language, req.test_types))
        if req.flow_description:
            tasks.append(generate_from_flow(req.flow_description, req.framework, req.language, req.test_types))

        if not tasks:
            raise HTTPException(400, "Provide at least one input (requirements, openapi_spec, source_code, or flow_description)")

        results = await asyncio.gather(*tasks)

        # Merge all test files
        all_files = []
        total_tests = 0
        for r in results:
            all_files.extend(r.get("test_files", []))
            total_tests += r.get("tests_generated", 0)

        return {
            "test_suite_id": results[0]["test_suite_id"],
            "sources_analyzed": len(results),
            "tests_generated": total_tests,
            "test_files": all_files,
            "individual_results": results,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/provider", summary="Get current LLM provider info")
async def provider_info():
    return get_provider_info()
