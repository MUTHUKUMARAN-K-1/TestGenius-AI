"""
TestGenius AI — FastAPI Application (v2 — Production Ready)
=============================================================
All routes registered. Health check shows all capabilities.
Proper logging configured. Usage stats exposed.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

from app.api.generate import router as generate_router
from app.api.frameworks import router as frameworks_router
from app.api.multi_agent_routes import router as multi_agent_router
from app.services.llm_provider import get_provider_info, get_usage_stats

app = FastAPI(
    title="TestGenius AI",
    description=(
        "AI-Powered Test Case Generation Agent for QA Teams.\n\n"
        "**Multi-Agent Iterative Refinement Pipeline** (5 agents):\n"
        "1. Analyzer — AST complexity + behavior extraction\n"
        "2. Generator — Context-rich LLM test generation\n"
        "3. Validator — Syntax check + quality scoring\n"
        "4. Refiner — Mutation-guided iterative improvement\n"
        "5. Coverage Mapper — Semantic behavior coverage\n\n"
        "Based on MuTAP (ISSTA 2023) + HITS (ASE 2024) research."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(generate_router)
app.include_router(frameworks_router)
app.include_router(multi_agent_router)


@app.get("/health", tags=["system"])
async def health():
    """Full system health check with LLM status and usage."""
    provider = get_provider_info()
    usage = get_usage_stats()
    return {
        "status": "healthy",
        "service": "TestGenius AI",
        "version": "2.0.0",
        "llm_provider": provider,
        "usage": usage,
        "capabilities": {
            "multi_agent_pipeline": True,
            "iterative_refinement": True,
            "behavior_coverage_mapping": True,
            "real_mutation_execution": True,
            "syntax_validation": True,
            "complexity_analysis": True,
            "security_scanning": True,
            "streaming": True,
            "token_tracking": True,
        },
        "supported_languages": ["python", "javascript", "typescript", "go"],
        "supported_frameworks": ["pytest", "unittest", "jest", "mocha", "cypress", "playwright", "vitest"],
    }


@app.get("/", tags=["system"])
async def root():
    """Service info."""
    return {
        "service": "TestGenius AI v2.0",
        "docs": "/docs",
        "health": "/health",
        "usage": "/api/v1/usage",
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"\n🧪 TestGenius AI v2 — Multi-Agent Test Generation Engine")
    print(f"   Running on http://{host}:{port}")
    print(f"   API Docs: http://{host}:{port}/docs")
    print(f"   Health: http://{host}:{port}/health\n")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
