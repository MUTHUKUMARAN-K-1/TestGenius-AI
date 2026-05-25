import { useState, useEffect } from 'react';
import {
  Zap, Bot, Search, CheckCircle, RefreshCw, Map,
  Copy, Download, Check, ChevronDown,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TABS = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'api',          label: 'API Spec'      },
  { id: 'code',         label: 'Source Code'   },
  { id: 'flow',         label: 'User Flow'     },
];

const FRAMEWORKS: Record<string, string[]> = {
  python:     ['pytest', 'unittest'],
  javascript: ['jest', 'mocha', 'cypress', 'playwright'],
  typescript: ['jest', 'vitest', 'playwright'],
};

const AGENTS = [
  { label: 'Analyzer',  icon: Search      },
  { label: 'Generator', icon: Zap         },
  { label: 'Validator', icon: CheckCircle },
  { label: 'Refiner',   icon: RefreshCw   },
  { label: 'Mapper',    icon: Map         },
];

const GRADE_CFG: Record<string, { text: string; ring: string; glow: string }> = {
  A: { text: 'text-emerald-400', ring: '#10b981', glow: 'shadow-emerald-500/20' },
  B: { text: 'text-blue-400',    ring: '#3b82f6', glow: 'shadow-blue-500/20'    },
  C: { text: 'text-amber-400',   ring: '#f59e0b', glow: 'shadow-amber-500/20'   },
  D: { text: 'text-red-400',     ring: '#ef4444', glow: 'shadow-red-500/20'     },
};

const SCORE_META: Record<string, { label: string; color: string }> = {
  assertions:     { label: 'Assertions',     color: '#3b82f6' },
  edge_cases:     { label: 'Edge Cases',     color: '#8b5cf6' },
  error_handling: { label: 'Error Handling', color: '#10b981' },
  isolation:      { label: 'Isolation',      color: '#f59e0b' },
  docs:           { label: 'Documentation',  color: '#ec4899' },
};

const EXAMPLES: Record<string, string> = {
  requirements: `As a QA team, test user authentication:\n- Valid email + password → returns JWT token (200 OK)\n- Wrong password → 401 Unauthorized with error message\n- Locked account → 403 Forbidden\n- Missing fields → 400 Bad Request\n- SQL injection in email field → sanitized, 400 returned\n- Rate limit: 5 failed attempts → 429 Too Many Requests\n- Token expiry → 401 with refresh hint`,
  api: `{\n  "openapi": "3.0.0",\n  "info": { "title": "User API", "version": "1.0.0" },\n  "paths": {\n    "/users/{id}": {\n      "get": {\n        "summary": "Get user by ID",\n        "parameters": [{"name": "id", "in": "path", "required": true, "schema": {"type": "integer"}}],\n        "responses": {\n          "200": {"description": "User object"},\n          "404": {"description": "User not found"},\n          "401": {"description": "Unauthorized"}\n        }\n      }\n    },\n    "/users": {\n      "post": {\n        "summary": "Create user",\n        "responses": {"201": {"description": "Created"}, "400": {"description": "Validation error"}}\n      }\n    }\n  }\n}`,
  code: `def calculate_discount(price: float, user_type: str) -> float:\n    """Calculate discount amount based on user membership type."""\n    if price <= 0:\n        raise ValueError("Price must be positive")\n    if user_type == "premium":\n        return price * 0.20\n    elif user_type == "member":\n        return price * 0.10\n    elif user_type == "guest":\n        return 0.0\n    raise ValueError(f"Unknown user type: {user_type}")`,
  flow: `E-Commerce Checkout Flow:\n1. User adds items to cart (/cart)\n2. Proceeds to checkout (/checkout)\n3. Enters shipping address (name, street, city, zip)\n4. Selects payment method (card / PayPal)\n5. Confirms order → system validates stock\n6. Processes payment via Stripe\n7. Sends confirmation email\n8. Redirects to /order-confirmation\n\nEdge cases: out-of-stock items, payment failure, invalid address, empty cart, session expiry mid-checkout`,
};

function QualityRing({ score, grade }: { score: number; grade: string }) {
  const r = 38; const circ = 2 * Math.PI * r;
  const cfg = GRADE_CFG[grade] || GRADE_CFG['B'];
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={cfg.ring} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="flex flex-col items-center">
        <span className={`text-3xl font-black ${cfg.text}`}>{grade}</span>
        <span className="text-xs text-slate-500 font-medium">{score}/100</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
    </div>
  );
}

export function GeneratePage() {
  const [tab, setTab]               = useState('code');
  const [input, setInput]           = useState('');
  const [lang, setLang]             = useState('python');
  const [framework, setFramework]   = useState('pytest');
  const [testTypes, setTestTypes]   = useState(['unit', 'integration', 'edge_case', 'security']);
  const [useMultiAgent, setUseMultiAgent] = useState(true);
  const [result, setResult]         = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [activeFile, setActiveFile] = useState(0);
  const [outputTab, setOutputTab]   = useState<'overview' | 'code' | 'coverage' | 'mutations'>('overview');
  const [copied, setCopied]         = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(''); setResult(null); setOutputTab('overview');
    try {
      const endpoint = useMultiAgent
        ? '/api/v1/generate/multi-agent'
        : `/api/v1/generate/from-${tab === 'api' ? 'api-spec' : tab === 'flow' ? 'flow' : tab === 'requirements' ? 'requirements' : 'code'}`;
      let body: any = { framework, language: lang, test_types: testTypes };
      if (useMultiAgent) {
        body.max_iterations = 3;
        if (tab === 'requirements') body.requirements = input;
        else if (tab === 'api') body.openapi_spec = JSON.parse(input);
        else if (tab === 'code') body.source_code = input;
        else body.requirements = input;
      } else {
        if (tab === 'requirements') body.requirements = input;
        else if (tab === 'api') body.openapi_spec = JSON.parse(input);
        else if (tab === 'code') { body.source_code = input; body.filename = 'source.py'; }
        else body.flow_description = input;
      }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).detail || `Error ${res.status}`);
      const data = await res.json();
      setResult(data); setActiveFile(0);
      const entry = { ...data, _input: input.slice(0, 120), _tab: tab, _framework: framework, _lang: lang, _ts: new Date().toISOString() };
      const prev: any[] = JSON.parse(localStorage.getItem('tg_history') || '[]');
      localStorage.setItem('tg_history', JSON.stringify([entry, ...prev].slice(0, 20)));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading && input.trim()) {
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, loading]);

  const copyCode = () => {
    navigator.clipboard.writeText(testFiles[activeFile]?.code || result?.test_code || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const downloadCode = () => {
    const code = testFiles[activeFile]?.code || result?.test_code || '';
    const fname = testFiles[activeFile]?.filename || 'tests.py';
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([code])), download: fname });
    a.click();
  };
  const downloadAll = () => {
    const all = testFiles.map((f: any) => `# ${'='.repeat(60)}\n# ${f.filename}\n# ${'='.repeat(60)}\n\n${f.code}`).join('\n\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([all], { type: 'text/plain' })),
      download: 'all_tests.txt',
    });
    a.click();
  };

  const testFiles     = result?.test_files || [];
  const quality       = result?.quality;
  const coverage      = result?.behavior_coverage;
  const mutation      = result?.mutation_testing;
  const syntax        = result?.syntax_validation;
  const iterations    = result?.iterations_performed ?? 0;
  const timeMs        = result?.processing_time_ms;
  const runId         = result?.run_id;
  const qualityScores = quality?.scores || {};
  const uncovered: string[] = coverage?.uncovered_behaviors || [];

  const testCount = syntax?.test_count ?? (testFiles.reduce((s: number, f: any) => s + (f.num_tests || 0), 0) || '—');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white tracking-tight">Test Generation Studio</h1>
        <p className="text-slate-500 text-sm mt-1">Multi-agent AI pipeline • Iterative refinement • Behavior coverage</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.35fr] gap-6">

        {/* ═══ LEFT: Input Panel ═══ */}
        <div className="flex flex-col gap-4">

          {/* Input type tabs */}
          <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setInput(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  tab === t.id
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Config row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language select */}
            <div className="relative">
              <select
                value={lang}
                onChange={e => { setLang(e.target.value); setFramework(FRAMEWORKS[e.target.value]?.[0] || 'pytest'); }}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                {Object.keys(FRAMEWORKS).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Framework select */}
            <div className="relative">
              <select
                value={framework}
                onChange={e => setFramework(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                {(FRAMEWORKS[lang] || []).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Multi-agent toggle */}
            <label className="flex items-center gap-2 cursor-pointer ml-auto bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 hover:border-slate-600 transition-colors">
              <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${useMultiAgent ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${useMultiAgent ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <Bot className={`w-3.5 h-3.5 ${useMultiAgent ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-semibold ${useMultiAgent ? 'text-blue-400' : 'text-slate-500'}`}>Multi-Agent</span>
            </label>
          </div>

          {/* Test type pills */}
          <div className="flex flex-wrap gap-2">
            {['unit', 'integration', 'edge_case', 'security', 'e2e'].map(t => (
              <button
                key={t}
                onClick={() => setTestTypes(testTypes.includes(t) ? testTypes.filter(x => x !== t) : [...testTypes, t])}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  testTypes.includes(t)
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Shortcut hint + example fill */}
          <div className="flex items-center justify-between -mt-1">
            <span className="text-[11px] text-slate-600">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-500 text-[10px] font-mono">Ctrl+Enter</kbd>
              {' '}to generate
            </span>
            <button
              onClick={() => setInput(EXAMPLES[tab] || '')}
              className="text-[11px] text-blue-500 hover:text-blue-400 transition-colors duration-150 cursor-pointer"
            >
              Try example →
            </button>
          </div>

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                tab === 'code'         ? 'Paste your source code here...'
                : tab === 'api'        ? 'Paste OpenAPI / Swagger JSON spec...'
                : tab === 'flow'       ? 'Describe the user flow or scenario...'
                : 'Paste your requirements or user stories...'
              }
              className="w-full min-h-[300px] bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200 text-sm font-mono leading-relaxed rounded-xl p-4 resize-none outline-none placeholder:text-slate-600 transition-colors duration-200"
            />
            {input && (
              <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                {input.length} chars
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className={`h-12 w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              loading || !input.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running pipeline...
              </>
            ) : useMultiAgent ? (
              <>
                <Bot className="w-4 h-4" />
                Run Multi-Agent Pipeline
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Tests
              </>
            )}
          </button>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Output Panel ═══ */}
        {result ? (
          <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 animate-fade-in" style={{ minHeight: 560 }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-800/80 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono text-slate-500">{runId || 'RUN-???'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">multi-agent v2</span>
                {iterations > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {iterations} iter{iterations !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {timeMs && <span className="text-[11px] text-slate-500 font-mono">{(timeMs / 1000).toFixed(1)}s</span>}
                {syntax?.valid && <span className="text-[11px] text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> valid</span>}
              </div>
            </div>

            {/* Nav tabs */}
            <div className="flex border-b border-slate-700/60 bg-slate-800/40">
              {(['overview', 'code', 'coverage', 'mutations'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setOutputTab(t)}
                  className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
                    outputTab === t
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'overview' ? 'Overview' : t === 'code' ? 'Code' : t === 'coverage' ? 'Coverage' : 'Mutations'}
                </button>
              ))}
            </div>

            {/* ── Overview ── */}
            {outputTab === 'overview' && (
              <div className="flex-1 overflow-auto p-5 space-y-4">
                {/* Quality ring + stat cards */}
                <div className="flex gap-4 items-stretch">
                  {quality && (
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-w-[140px]">
                      <QualityRing score={quality.overall} grade={quality.grade} />
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Quality Score</span>
                    </div>
                  )}
                  <div className="flex-1 grid grid-cols-2 gap-2.5">
                    <StatCard label="Tests Generated" value={testCount} sub={framework} />
                    <StatCard label="Behavior Coverage" value={coverage ? `${coverage.coverage_pct?.toFixed(0)}%` : '—'} sub={coverage ? `${coverage.covered}/${coverage.total_behaviors} behaviors` : undefined} color="text-emerald-400" />
                    <StatCard label="Mutation Score" value={mutation ? `${mutation.mutation_score?.toFixed(0)}%` : '—'} sub={mutation ? `${mutation.killed}/${mutation.total_mutants} killed` : undefined} color="text-purple-400" />
                    <StatCard label="Iterations" value={iterations || 1} sub="refinement passes" color="text-blue-400" />
                  </div>
                </div>

                {/* Quality sub-scores */}
                {quality && Object.keys(qualityScores).length > 0 && (
                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Quality Breakdown</p>
                    <div className="space-y-2.5">
                      {Object.entries(qualityScores).map(([key, val]) => {
                        const meta = SCORE_META[key] || { label: key, color: '#3b82f6' };
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-28 shrink-0">{meta.label}</span>
                            <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((val as number) / 10) * 100}%`, background: meta.color }} />
                            </div>
                            <span className="text-xs font-bold text-slate-300 w-8 text-right">{val as number}/10</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Agent pipeline */}
                <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Agent Pipeline</p>
                  <div className="flex items-center">
                    {AGENTS.map(({ icon: Icon, label }, i) => (
                      <div key={label} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-emerald-400" />
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 text-center">{label}</span>
                        </div>
                        {i < AGENTS.length - 1 && <div className="w-5 h-px bg-emerald-500/25 shrink-0 mb-5" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mutation strip */}
                {mutation && (
                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mutation Testing</p>
                      <span className="text-xs font-black text-purple-400">{mutation.mutation_score?.toFixed(1)}% kill rate</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mb-2.5">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000"
                        style={{ width: `${mutation.mutation_score || 0}%` }} />
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{mutation.killed} killed</span>
                      <span className="text-red-400">{mutation.survived} survived</span>
                      <span className="text-slate-600 ml-auto">{mutation.total_mutants} total</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Code ── */}
            {outputTab === 'code' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center px-4 py-2.5 border-b border-slate-700/60 bg-slate-800/30 gap-2">
                  <div className="flex gap-1 flex-1 overflow-x-auto">
                    {testFiles.length > 0
                      ? testFiles.map((f: any, i: number) => (
                          <button key={i} onClick={() => setActiveFile(i)} className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-all duration-200 ${i === activeFile ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                            {f.filename} <span className="text-slate-600">({f.num_tests})</span>
                          </button>
                        ))
                      : <span className="text-xs text-slate-600 font-mono">output</span>
                    }
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={copyCode} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>
                      {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                    </button>
                    <button onClick={downloadCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all duration-200 cursor-pointer">
                      <Download className="w-3 h-3" /> Download
                    </button>
                    {testFiles.length > 1 && (
                      <button onClick={downloadAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-all duration-200 cursor-pointer">
                        <Download className="w-3 h-3" /> All ({testFiles.length})
                      </button>
                    )}
                  </div>
                </div>
                <pre className="flex-1 overflow-auto p-5 text-sm text-slate-200 font-mono leading-[1.75] bg-transparent">
                  <code>{testFiles[activeFile]?.code || result?.test_code || 'No code generated'}</code>
                </pre>
              </div>
            )}

            {/* ── Coverage ── */}
            {outputTab === 'coverage' && (
              <div className="flex-1 overflow-auto p-5 space-y-4">
                {coverage ? (
                  <>
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 flex items-center gap-6">
                      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r="38" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <circle cx="48" cy="48" r="38" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(coverage.coverage_pct / 100) * (2 * Math.PI * 38)} ${2 * Math.PI * 38}`} />
                        </svg>
                        <span className="text-xl font-black text-emerald-400">{coverage.coverage_pct?.toFixed(0)}%</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Behavior Coverage</p>
                        <p className="text-slate-400 text-sm">{coverage.covered} of {coverage.total_behaviors} behaviors tested</p>
                        {coverage.uncovered > 0 && <p className="text-red-400 text-sm mt-1">{coverage.uncovered} untested behaviors flagged</p>}
                      </div>
                    </div>
                    {uncovered.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Untested Behaviors</p>
                        <div className="space-y-2">
                          {uncovered.map((b: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                              <span className="text-slate-300">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No coverage data</div>
                )}
              </div>
            )}

            {/* ── Mutations ── */}
            {outputTab === 'mutations' && (
              <div className="flex-1 overflow-auto p-5 space-y-4">
                {mutation ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-black text-purple-400">{mutation.total_mutants}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Total Mutants</div>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <div className="text-3xl font-black text-emerald-400">{mutation.killed}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Killed</div>
                      </div>
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                        <div className="text-3xl font-black text-red-400">{mutation.survived}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Survived</div>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kill Rate</p>
                        <span className="text-xl font-black text-purple-400">{mutation.mutation_score?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-700/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all duration-1000"
                          style={{ width: `${mutation.mutation_score || 0}%` }} />
                      </div>
                    </div>
                    {mutation.survived > 0 && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                          {mutation.survived} Surviving Mutant{mutation.survived !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-slate-400">The Refiner agent added tests to target these in subsequent iterations.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No mutation data</div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty / Loading state */
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50" style={{ minHeight: 560 }}>
            {loading ? (
              <div className="flex flex-col items-center gap-6 px-8">
                <div className="flex gap-3">
                  {AGENTS.map(({ icon: Icon, label }, i) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div
                        className="w-11 h-11 rounded-xl border-2 border-blue-500/30 bg-blue-500/5 flex items-center justify-center animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-[10px] text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Pipeline running...</p>
                  <p className="text-slate-500 text-xs mt-1">5 agents analyzing and iterating</p>
                </div>
              </div>
            ) : (
              <div className="text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto mb-5">
                  <Bot className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Ready to Generate</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-5">
                  Paste your input and run the pipeline.
                  {useMultiAgent && <span className="text-blue-400"> Multi-agent mode iteratively refines until Grade A.</span>}
                </p>
                <div className="grid grid-cols-2 gap-2 text-left max-w-xs mx-auto">
                  {AGENTS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
