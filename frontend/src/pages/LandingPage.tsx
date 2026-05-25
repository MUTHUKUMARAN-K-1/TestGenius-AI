import {
  ArrowRight, CheckCircle, Code2, Microscope,
  BarChart3, RefreshCw, Shield, Bot, Search, Zap, Map,
  GitBranch, Activity, ChevronRight, Users, FileText, Terminal,
} from 'lucide-react';

interface Props { onNavigate: (page: any) => void; }

const FEATURES = [
  {
    icon: Code2,
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
    accent: 'text-blue-400',
    title: 'AST Code Analysis',
    desc: 'Cyclomatic complexity scoring, behavior extraction, and coverage gap detection with real static analysis.',
  },
  {
    icon: Microscope,
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/20',
    accent: 'text-purple-400',
    title: 'Mutation Testing',
    desc: 'Real mutation execution — mutates your code, runs tests against mutants, identifies survivors to target.',
  },
  {
    icon: BarChart3,
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/20',
    accent: 'text-emerald-400',
    title: 'Behavior Coverage',
    desc: 'Semantic mapping of tested vs untested behaviors. See exactly what your tests cover — and what they miss.',
  },
  {
    icon: RefreshCw,
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/20',
    accent: 'text-amber-400',
    title: 'Iterative Refinement',
    desc: 'MuTAP-inspired loop: generate → validate → improve until Grade A. Tests get stronger with each iteration.',
  },
  {
    icon: Shield,
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/20',
    accent: 'text-red-400',
    title: 'Security Scanner',
    desc: 'OWASP Top 10 detection: IDOR, SQL injection, mass assignment, missing auth, path traversal.',
  },
  {
    icon: Bot,
    color: 'from-cyan-500/20 to-cyan-600/10',
    border: 'border-cyan-500/20',
    accent: 'text-cyan-400',
    title: 'Multi-Agent Pipeline',
    desc: '5 specialized AI agents — Analyzer, Generator, Validator, Refiner, Mapper — working in sequence.',
  },
];

const AGENTS = [
  { icon: Search,     label: 'Analyzer',        desc: 'AST + complexity' },
  { icon: Zap,        label: 'Generator',       desc: 'Behavior-guided' },
  { icon: CheckCircle,label: 'Validator',       desc: 'Quality scoring' },
  { icon: RefreshCw,  label: 'Refiner',         desc: 'Mutation feedback' },
  { icon: Map,        label: 'Mapper',          desc: 'Coverage map' },
];

const STATS = [
  { value: '85+',  label: 'Quality Score',     sub: 'grade A output' },
  { value: '5',    label: 'AI Agents',         sub: 'specialized roles' },
  { value: '<4s',  label: 'Per Pipeline Run',  sub: 'end-to-end' },
  { value: '87%',  label: 'Mutation Kill Rate', sub: 'avg across runs' },
];

export function LandingPage({ onNavigate }: Props) {
  return (
    <div className="bg-[#020617] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="TestGenius AI" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-white text-sm">TestGenius <span className="text-blue-400">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Pipeline', 'Research'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 cursor-pointer">
                {item}
              </a>
            ))}
          </nav>
          <button
            onClick={() => onNavigate('generate')}
            className="flex items-center gap-2 px-4 h-9 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg cursor-pointer transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            Start Building <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 hero-grid opacity-100" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-glow pointer-events-none" style={{ animationDelay: '2.5s' }} />

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-24">

            {/* Left */}
            <div className="flex flex-col gap-7 max-w-2xl animate-fade-up">
              {/* Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">v2.0 — Research Grade</span>
              </div>

              {/* Heading */}
              <h1 className="text-6xl lg:text-[4.5rem] font-black leading-[0.93] tracking-tight">
                <span className="text-white">Generate</span><br />
                <span className="text-white">Tests. </span>
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                  Grade&nbsp;A,
                </span><br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Automatically.
                </span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                5 specialized AI agents analyze your code, generate tests, validate quality, and iteratively refine using mutation testing feedback — until Grade A is achieved.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => onNavigate('generate')}
                  className="flex items-center gap-2 px-7 h-13 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl cursor-pointer transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 text-base"
                  style={{ height: 52 }}
                >
                  Start Generating Tests <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('analyze')}
                  className="flex items-center gap-2 px-7 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl cursor-pointer transition-all duration-200 text-base"
                  style={{ height: 52 }}
                >
                  Analyze Code
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Real Mutation Execution</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Any OpenAI-compatible LLM</span>
                </div>
              </div>
            </div>

            {/* Right: Mock output card */}
            <div className="relative hidden lg:block animate-float">
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 ml-1">testgenius / multi-agent / output</span>
                </div>
                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Run info */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">MAS-a7f3b2c9</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">multi-agent v2</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">2 iterations</span>
                    <span className="ml-auto text-[11px] text-slate-600 font-mono">4.2s</span>
                  </div>
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-slate-800/70 border border-emerald-500/20 rounded-xl p-3 flex flex-col items-center col-span-1">
                      <div className="text-3xl font-black text-emerald-400">A</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">85/100</div>
                      <div className="text-[9px] text-slate-600 mt-0.5">Quality</div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      {[['18', 'Tests', 'text-white'], ['75%', 'Mutation', 'text-purple-400'], ['83%', 'Coverage', 'text-emerald-400'], ['2', 'Iterations', 'text-blue-400']].map(([v, l, c]) => (
                        <div key={l} className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-2.5">
                          <div className={`text-lg font-black ${c}`}>{v}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Quality bars */}
                  <div className="space-y-2">
                    {[['Assertions', 8, '#3b82f6'], ['Edge Cases', 7, '#8b5cf6'], ['Error Handling', 9, '#10b981']].map(([l, v, c]) => (
                      <div key={l as string} className="flex items-center gap-2.5">
                        <span className="text-[10px] text-slate-500 w-24 shrink-0">{l}</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${((v as number) / 10) * 100}%`, background: c as string }} />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right">{v}/10</span>
                      </div>
                    ))}
                  </div>
                  {/* Mutation strip */}
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 flex items-center gap-3">
                    <Microscope className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-purple-400">Mutation Testing</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">9/12 mutants killed • 3 survived → refining</div>
                    </div>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-10">
          <div className="flex flex-col items-center gap-2 text-slate-600 animate-bounce">
            <span className="text-xs font-medium">Scroll to explore</span>
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </section>

      {/* ── Agent Pipeline ── */}
      <section id="pipeline" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">5-Agent Pipeline</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">From code to Grade A tests</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Each agent has a specialized role. Together they produce tests that actually catch bugs.</p>
          </div>

          {/* Agent steps */}
          <div className="relative flex items-start gap-0">
            {AGENTS.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex-1 flex items-start">
                <div className="flex flex-col items-center gap-3 flex-1">
                  {/* Step number + icon */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 flex items-center justify-center group hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-200 cursor-default">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 border-2 border-[#020617] flex items-center justify-center">
                      <span className="text-[9px] font-black text-white">{i + 1}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white mb-1">{label}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
                {i < AGENTS.length - 1 && (
                  <div className="flex items-center mt-7 mx-1 shrink-0">
                    <div className="w-full h-px bg-gradient-to-r from-blue-500/40 to-purple-500/20" style={{ width: 24 }} />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 -ml-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for QA Teams ── */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Built for QA Teams</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">4 ways to generate tests</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Paste any artifact your team already has — requirements, API specs, source code, or user flows.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: FileText,
                colorBg: 'bg-blue-500/10',
                colorBorder: 'border-blue-500/20',
                accent: 'text-blue-400',
                label: 'Requirements',
                badge: 'User Stories / BDD',
                desc: 'Paste Jira tickets, user stories, or acceptance criteria. Agents extract all testable behaviors and generate unit, integration, and edge-case tests.',
                example: 'As a user, I want to reset my password via email...',
                generates: ['Unit tests', 'Validation tests', 'Security checks'],
              },
              {
                icon: Code2,
                colorBg: 'bg-purple-500/10',
                colorBorder: 'border-purple-500/20',
                accent: 'text-purple-400',
                label: 'API Spec',
                badge: 'OpenAPI / Swagger',
                desc: 'Drop in your OpenAPI JSON. Agents generate endpoint tests, auth boundary tests, and OWASP Top 10 security checks for every route.',
                example: '{"openapi": "3.0.0", "paths": {"/users/{id}": {...}}}',
                generates: ['Endpoint tests', 'Auth boundary', 'OWASP checks'],
              },
              {
                icon: Terminal,
                colorBg: 'bg-emerald-500/10',
                colorBorder: 'border-emerald-500/20',
                accent: 'text-emerald-400',
                label: 'Source Code',
                badge: 'Python · JS · TypeScript',
                desc: 'Paste any function or class. AST analysis extracts every code path, then mutation-guided agents generate tests that target all branches.',
                example: 'def calculate_discount(price: float, user_type: str):',
                generates: ['Branch tests', 'Mutation-guided', 'Edge cases'],
              },
              {
                icon: GitBranch,
                colorBg: 'bg-amber-500/10',
                colorBorder: 'border-amber-500/20',
                accent: 'text-amber-400',
                label: 'User Flow',
                badge: 'E2E Scenarios',
                desc: 'Describe your frontend journey in plain text. Agents generate E2E scenarios for Playwright or Cypress covering happy path and all failure modes.',
                example: 'User logs in → adds to cart → checkout → payment...',
                generates: ['E2E tests', 'Happy path', 'Error flows'],
              },
            ].map(({ icon: Icon, colorBg, colorBorder, accent, label, badge, desc, example, generates }) => (
              <div key={label} className={`bg-slate-900/60 border ${colorBorder} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 cursor-default`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl ${colorBg} border ${colorBorder} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${accent}`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colorBg} border ${colorBorder} ${accent} uppercase tracking-wider`}>{badge}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>
                <div className={`bg-slate-800/60 border ${colorBorder} rounded-lg px-3 py-2 mb-4`}>
                  <span className="text-[11px] font-mono text-slate-500 italic">"{example}"</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generates.map(g => (
                    <span key={g} className={`text-[10px] px-2.5 py-0.5 rounded-full border ${colorBorder} ${colorBg} ${accent} font-semibold`}>{g}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">8 Novelty Features</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Built for QA velocity</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Research-backed tools built with the precision required for production testing.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, border, accent, title, desc }) => (
              <div
                key={title}
                className={`group relative bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} border ${border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${accent}`} />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-0 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            {STATS.map(({ value, label, sub }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center py-12 px-6 text-center ${i < STATS.length - 1 ? 'border-r border-slate-800' : ''} hover:bg-slate-800/40 transition-colors duration-200`}
              >
                <div className="text-5xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-2">{value}</div>
                <div className="text-white font-semibold text-sm mb-1">{label}</div>
                <div className="text-slate-500 text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code Demo ── */}
      <section id="research" className="py-28 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">See it in action</h2>
            <p className="text-slate-400 text-lg">Paste code → 5 agents run → Grade A tests, validated.</p>
          </div>
          <div className="code-window">
            <div className="code-header">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-4 text-xs text-slate-500 font-mono">testgenius / pipeline / demo.py</span>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="p-6 border-r border-[#21262d]">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4">Input — Source Code</div>
                <pre className="text-sm leading-7 font-mono">
                  <span className="text-[#569cd6]">def </span>
                  <span className="text-[#dcdcaa]">calculate_discount</span>
                  <span className="text-slate-300">(price, type):</span>{'\n'}
                  {'  '}<span className="text-[#c586c0]">if</span> <span className="text-slate-300">price</span> <span className="text-[#d4d4d4]">{'<='}</span> <span className="text-[#b5cea8]">0</span><span className="text-slate-300">:</span>{'\n'}
                  {'    '}<span className="text-[#c586c0]">raise</span> <span className="text-[#4ec9b0]">ValueError</span><span className="text-slate-300">()</span>{'\n'}
                  {'  '}<span className="text-[#c586c0]">if</span> <span className="text-slate-300">type ==</span> <span className="text-[#ce9178]">"premium"</span><span className="text-slate-300">:</span>{'\n'}
                  {'    '}<span className="text-[#c586c0]">return</span> <span className="text-slate-300">price</span> <span className="text-[#d4d4d4]">*</span> <span className="text-[#b5cea8]">0.2</span>{'\n'}
                  {'  '}<span className="text-[#c586c0]">return</span> <span className="text-[#b5cea8]">0</span>
                </pre>
              </div>
              <div className="p-6 relative">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4">Output — Grade A Tests</div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-400">18 tests generated</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">happy path + edge cases + error handling</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <Microscope className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-purple-400">Mutation score: 87%</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">13/15 mutants killed after 2 refinements</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-blue-400">Coverage: 92% behaviors</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">1 untested behavior flagged for review</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className="gradient-border bg-slate-900/80 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Ready to generate<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">better tests?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Paste your code. Run the pipeline. Get Grade A tests with full coverage and mutation analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('generate')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-13 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl cursor-pointer transition-all duration-200 shadow-xl shadow-blue-500/25 hover:-translate-y-0.5 text-base"
                style={{ height: 52 }}
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl cursor-pointer transition-all duration-200 text-base"
                style={{ height: 52 }}
              >
                Configure LLM
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/logo.png" alt="TestGenius AI" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-bold text-white text-sm">TestGenius <span className="text-blue-400">AI</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                AI-powered test generation for QA teams. Inspired by MuTAP (ISSTA 2023), HITS (ASE 2024), and Code Agents research.
              </p>
            </div>
            {[
              { h: 'Product',   l: ['Pipeline', 'Analysis', 'Mutations', 'Security'] },
              { h: 'Resources', l: ['API Docs', 'Research', 'Providers', 'Changelog'] },
              { h: 'Company',   l: ['About', 'GitHub', 'License', 'Contact'] },
            ].map(({ h, l }) => (
              <div key={h} className="flex flex-col gap-3">
                <h4 className="text-slate-300 font-semibold text-sm">{h}</h4>
                {l.map(x => (
                  <a key={x} href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-150 cursor-pointer">{x}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-8 border-t border-slate-800/60">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} TestGenius AI. MIT License.</p>
            <p className="text-slate-600 text-xs font-mono">Research-grade • Production-ready</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
