#!/usr/bin/env python3
"""
TestGenius AI — CLI
====================
Generate tests directly from the terminal without running the API server.

Usage:
    python cli.py --code path/to/source.py
    python cli.py --requirements "User can sign up with email and password"
    python cli.py --api-spec path/to/openapi.json
    python cli.py --code src/auth.py --framework pytest --lang python --types unit edge_case
    python cli.py --code src/app.ts --framework jest --lang typescript --output tests/
"""

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(Path(__file__).parent / ".env")

# ── helpers ────────────────────────────────────────────────────────────────────

RESET  = "\033[0m"
BOLD   = "\033[1m"
BLUE   = "\033[34m"
GREEN  = "\033[32m"
YELLOW = "\033[33m"
RED    = "\033[31m"
CYAN   = "\033[36m"
DIM    = "\033[2m"

def header():
    print(f"\n{BOLD}{BLUE}🧪 TestGenius AI{RESET} {DIM}— CLI Test Generator{RESET}")
    print(f"{DIM}{'─' * 50}{RESET}\n")

def status(msg: str):
    print(f"  {CYAN}→{RESET} {msg}")

def success(msg: str):
    print(f"  {GREEN}✓{RESET} {msg}")

def warn(msg: str):
    print(f"  {YELLOW}⚠{RESET}  {msg}")

def err(msg: str):
    print(f"  {RED}✗{RESET} {msg}", file=sys.stderr)

def grade_color(grade: str) -> str:
    return {
        "A": GREEN, "B": CYAN, "C": YELLOW, "D": RED
    }.get(grade, RESET)


# ── core runner ────────────────────────────────────────────────────────────────

async def run_generation(args):
    # Validate LLM key
    if not os.environ.get("LLM_API_KEY"):
        err("LLM_API_KEY not set — copy .env.example to .env and add your key")
        sys.exit(1)

    # Add app to path
    sys.path.insert(0, str(Path(__file__).parent))

    header()

    # ── Resolve input ──────────────────────────────────────────────────────────
    source_code    = None
    requirements   = None
    openapi_spec   = None
    input_label    = ""

    if args.code:
        p = Path(args.code)
        if not p.exists():
            err(f"File not found: {args.code}")
            sys.exit(1)
        source_code = p.read_text(encoding="utf-8")
        input_label = f"source file: {p.name}"
        status(f"Loaded {p.name} ({len(source_code):,} chars)")

    if args.requirements:
        requirements = args.requirements
        input_label = "requirements text"
        status(f"Requirements: {requirements[:80]}{'...' if len(requirements) > 80 else ''}")

    if args.api_spec:
        p = Path(args.api_spec)
        if not p.exists():
            err(f"File not found: {args.api_spec}")
            sys.exit(1)
        raw = p.read_text(encoding="utf-8")
        try:
            openapi_spec = json.loads(raw)
        except json.JSONDecodeError as e:
            err(f"Invalid JSON in API spec: {e}")
            sys.exit(1)
        input_label = f"API spec: {p.name}"
        status(f"Loaded OpenAPI spec: {p.name}")

    if not any([source_code, requirements, openapi_spec]):
        err("Provide at least one input: --code, --requirements, or --api-spec")
        sys.exit(1)

    test_types = args.types or ["unit", "integration", "edge_case"]
    framework  = args.framework
    language   = args.lang

    print()
    status(f"Mode:       {'Multi-Agent' if not args.simple else 'Simple'}")
    status(f"Framework:  {framework}")
    status(f"Language:   {language}")
    status(f"Test types: {', '.join(test_types)}")
    status(f"Input:      {input_label}")
    print()

    start = time.time()

    if args.simple:
        # ── Simple (single-pass) generation ───────────────────────────────────
        from app.services.test_generator import (
            generate_from_requirements,
            generate_from_api_spec,
            generate_from_code,
        )
        status("Running single-pass generation...")

        if source_code:
            result = await generate_from_code(source_code, framework=framework, language=language, test_types=test_types)
        elif requirements:
            result = await generate_from_requirements(requirements, framework=framework, language=language, test_types=test_types)
        else:
            result = await generate_from_api_spec(openapi_spec, framework=framework, language=language, test_types=test_types)
    else:
        # ── Multi-Agent pipeline ───────────────────────────────────────────────
        from app.services.multi_agent_engine import run_multi_agent_pipeline
        iters = args.iterations or 3
        status(f"Running multi-agent pipeline (max {iters} iterations)...")

        stages = ["🔬 Analyzing code...", "⚙️  Generating tests...", "✅ Validating quality...", "🔄 Refining with mutations...", "📊 Mapping coverage..."]
        for i, stage in enumerate(stages[:iters + 2]):
            print(f"    [{i+1}/{iters+2}] {stage}", end="\r", flush=True)
            await asyncio.sleep(0.1)  # just for display; real work below
        print()

        result = await run_multi_agent_pipeline(
            source_code=source_code or "",
            requirements=requirements or "",
            api_spec=openapi_spec,
            framework=framework,
            language=language,
            test_types=test_types,
            max_iterations=iters,
        )

    elapsed = time.time() - start

    # ── Print results ──────────────────────────────────────────────────────────
    print()
    print(f"{BOLD}{'─' * 50}{RESET}")
    print(f"{BOLD}Results{RESET}")
    print(f"{'─' * 50}{RESET}")

    test_files = result.get("test_files", [])
    quality    = result.get("quality")
    coverage   = result.get("behavior_coverage")
    mutations  = result.get("mutation_testing")

    if quality:
        grade = quality.get("grade", "?")
        score = quality.get("overall", 0)
        gc    = grade_color(grade)
        print(f"\n  Quality Grade:   {gc}{BOLD}{grade}{RESET} ({score}%)")

    if coverage:
        pct = coverage.get("coverage_pct", 0)
        print(f"  Behavior Cover.: {pct}% ({coverage.get('covered', 0)}/{coverage.get('total_behaviors', 0)} behaviors)")

    if mutations:
        ms = mutations.get("mutation_score", 0)
        print(f"  Mutation Score:  {ms}%  ({mutations.get('killed', 0)} killed / {mutations.get('survived', 0)} survived)")

    n_tests = result.get("tests_generated", sum(len(f.get("tests", [])) for f in test_files))
    print(f"  Tests Generated: {n_tests}")
    print(f"  Time:            {elapsed:.1f}s")
    print()

    # ── Write output ───────────────────────────────────────────────────────────
    if test_files:
        out_dir = Path(args.output) if args.output else Path(".")
        out_dir.mkdir(parents=True, exist_ok=True)

        written = []
        for tf in test_files:
            filename = tf.get("filename", f"test_{framework}.py")
            code     = tf.get("code", "")
            if code:
                out_path = out_dir / filename
                out_path.write_text(code, encoding="utf-8")
                written.append(str(out_path))

        for w in written:
            success(f"Written: {w}")
    else:
        # Fallback: single test_code key
        test_code = result.get("test_code", "")
        if test_code:
            default_ext = "ts" if language == "typescript" else "js" if language == "javascript" else "py"
            out_dir  = Path(args.output) if args.output else Path(".")
            out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / f"test_generated.{default_ext}"
            out_path.write_text(test_code, encoding="utf-8")
            success(f"Written: {out_path}")
        else:
            warn("No test code in response — check your LLM_API_KEY and model configuration")

    # Print to stdout if --print flag
    if args.print and test_files:
        print(f"\n{DIM}{'─' * 50}{RESET}")
        for tf in test_files:
            fname = tf.get("filename", "tests")
            print(f"\n{BOLD}# {fname}{RESET}")
            print(tf.get("code", ""))

    print()


# ── CLI definition ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="testgenius",
        description="TestGenius AI — Generate comprehensive tests from source code, requirements, or API specs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py --code src/auth.py
  python cli.py --requirements "Users can log in with email/password. Failed logins are rate-limited."
  python cli.py --api-spec openapi.json --framework pytest --lang python
  python cli.py --code src/cart.ts --framework jest --lang typescript --output tests/ --print
  python cli.py --code src/user.py --simple --types unit edge_case
        """
    )

    # Input (at least one required)
    inp = parser.add_argument_group("Input (provide at least one)")
    inp.add_argument("--code",         "-c",  metavar="FILE",   help="Source code file to generate tests for")
    inp.add_argument("--requirements", "-r",  metavar="TEXT",   help="Product requirements text (quoted string)")
    inp.add_argument("--api-spec",     "-a",  metavar="FILE",   help="OpenAPI/Swagger JSON spec file")

    # Generation config
    cfg = parser.add_argument_group("Generation config")
    cfg.add_argument("--framework",  "-f", default="pytest",   help="Test framework (pytest/jest/vitest/playwright/...) [default: pytest]")
    cfg.add_argument("--lang",       "-l", default="python",   help="Language (python/javascript/typescript/go) [default: python]")
    cfg.add_argument("--types",      "-t", nargs="+",          metavar="TYPE",
                     help="Test types: unit integration edge_case security e2e [default: unit integration edge_case]")
    cfg.add_argument("--iterations", "-i", type=int,           help="Multi-agent iterations (1-5) [default: 3]")
    cfg.add_argument("--simple",           action="store_true", help="Skip multi-agent pipeline, use single-pass generation")

    # Output
    out = parser.add_argument_group("Output")
    out.add_argument("--output", "-o", metavar="DIR",  help="Output directory [default: current directory]")
    out.add_argument("--print",  "-p", action="store_true", help="Also print generated code to stdout")

    args = parser.parse_args()

    try:
        asyncio.run(run_generation(args))
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Interrupted.{RESET}")
        sys.exit(130)
    except Exception as e:
        err(f"Unexpected error: {e}")
        if os.environ.get("DEBUG"):
            import traceback; traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
