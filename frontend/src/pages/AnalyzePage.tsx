import { useState } from 'react';
import { Search, Microscope, BarChart3, GitBranch, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VIEWS = [
  { id: 'complexity', label: 'Complexity',  icon: BarChart3   },
  { id: 'behaviors',  label: 'Behaviors',   icon: GitBranch   },
  { id: 'gaps',       label: 'Gaps',        icon: AlertTriangle },
  { id: 'mutations',  label: 'Mutations',   icon: Microscope  },
] as const;

const PRIORITY_CFG: Record<string, { bg: string; text: string; border: string }> = {
  HIGH:     { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
  MEDIUM:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
  LOW:      { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20' },
  critical: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
  high:     { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
  medium:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
};

const GRADE_CFG: Record<string, { text: string; bg: string; border: string }> = {
  A: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  B: { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  C: { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
  D: { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30'     },
};

export function AnalyzePage() {
  const [code, setCode]             = useState('');
  const [result, setResult]         = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [activeView, setActiveView] = useState<'complexity' | 'behaviors' | 'gaps' | 'mutations'>('complexity');

  const analyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/generate/multi-agent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, framework: 'pytest', language: 'python', test_types: ['unit'], max_iterations: 1 }),
      });
      if (res.ok) setResult(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const complexity = result?.analysis?.complexity;
  const gaps       = result?.analysis?.gaps;
  const mutations  = result?.mutation_testing;
  const behaviors  = result?.behavior_coverage;

  const gradeCfg = complexity?.grade ? (GRADE_CFG[complexity.grade] || GRADE_CFG['B']) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white tracking-tight">Code Analysis Studio</h1>
        <p className="text-slate-500 text-sm mt-1">Deep-dive into complexity, behaviors, coverage gaps, and mutations</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6">

        {/* ── Input ── */}
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Paste source code here for deep analysis..."
              className="w-full min-h-[400px] bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200 text-sm font-mono leading-relaxed rounded-xl p-4 resize-none outline-none placeholder:text-slate-600 transition-colors duration-200"
            />
            {code && (
              <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">{code.length} chars</div>
            )}
          </div>
          <button
            onClick={analyze}
            disabled={loading || !code.trim()}
            className={`h-12 w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              loading || !code.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5'
            }`}
          >
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing...</> : <><Search className="w-4 h-4" />Run Deep Analysis</>}
          </button>

          {/* Info cards */}
          {!result && !loading && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { icon: BarChart3, label: 'Complexity', desc: 'Cyclomatic score per function' },
                { icon: GitBranch, label: 'Behaviors', desc: 'Testable behavior extraction' },
                { icon: AlertTriangle, label: 'Gaps', desc: 'Untested code paths' },
                { icon: Microscope, label: 'Mutations', desc: 'Mutation point analysis' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <Icon className="w-4 h-4 text-slate-500 mb-2" />
                  <div className="text-xs font-semibold text-slate-300">{label}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col" style={{ minHeight: 480 }}>
          {result ? (
            <>
              {/* View tabs */}
              <div className="flex border-b border-slate-800 bg-slate-800/40">
                {VIEWS.map(({ id, label, icon: Icon }) => {
                  const count =
                    id === 'complexity' ? complexity?.functions?.length :
                    id === 'behaviors'  ? behaviors?.total_behaviors :
                    id === 'gaps'       ? gaps?.total_gaps :
                    id === 'mutations'  ? mutations?.total_mutants : undefined;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveView(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all duration-200 border-b-2 cursor-pointer ${
                        activeView === id
                          ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                      {count !== undefined && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeView === id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-5 overflow-auto flex-1">

                {/* ── Complexity ── */}
                {activeView === 'complexity' && complexity && (
                  <div className="space-y-3">
                    {gradeCfg && (
                      <div className={`flex items-center gap-4 p-4 rounded-xl ${gradeCfg.bg} border ${gradeCfg.border} mb-5`}>
                        <div className={`text-3xl font-black ${gradeCfg.text}`}>{complexity.grade}</div>
                        <div>
                          <div className={`text-sm font-bold ${gradeCfg.text}`}>Complexity Grade {complexity.grade}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Avg: <span className="font-mono">{complexity.average}</span> &nbsp;·&nbsp;
                            Suggested: <span className="font-mono">{complexity.suggested_total_tests}</span> tests
                          </div>
                        </div>
                      </div>
                    )}
                    {complexity.functions?.map((f: any, i: number) => {
                      const pCfg = PRIORITY_CFG[f.priority] || PRIORITY_CFG['LOW'];
                      return (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-800/30 hover:border-slate-700 transition-colors duration-200">
                          <div>
                            <span className="text-sm font-mono text-slate-200">{f.name}()</span>
                            <span className="text-xs text-slate-500 ml-2.5">complexity: <span className="text-slate-300 font-mono">{f.complexity}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${pCfg.bg} ${pCfg.text} ${pCfg.border}`}>{f.priority}</span>
                            <span className="text-xs text-slate-500 font-mono">{f.suggested_tests}t</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Behaviors ── */}
                {activeView === 'behaviors' && behaviors && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-4">
                      <div className="flex-1 h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${behaviors.coverage_pct}%` }} />
                      </div>
                      <span className="text-lg font-black text-white">{behaviors.coverage_pct}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      <span className="text-emerald-400 font-semibold">{behaviors.covered}</span> / {behaviors.total_behaviors} behaviors covered
                    </p>
                    {behaviors.uncovered_behaviors?.map((b: any, i: number) => {
                      const pCfg = PRIORITY_CFG[b.priority] || PRIORITY_CFG['medium'];
                      return (
                        <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${pCfg.bg} ${pCfg.border}`}>
                          <AlertTriangle className={`w-4 h-4 ${pCfg.text} shrink-0 mt-0.5`} />
                          <span className="text-sm text-slate-300 flex-1">{b.description}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${pCfg.bg} ${pCfg.text} ${pCfg.border} shrink-0`}>{b.priority}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Gaps ── */}
                {activeView === 'gaps' && gaps && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-4">
                      <div>
                        <div className="text-xs text-slate-500">Coverage Estimate</div>
                        <div className="text-2xl font-black text-white">{gaps.coverage_estimate}%</div>
                      </div>
                      <div className="w-px h-10 bg-slate-700" />
                      <div>
                        <div className="text-xs text-slate-500">High Priority Gaps</div>
                        <div className="text-2xl font-black text-red-400">{gaps.high_priority}</div>
                      </div>
                    </div>
                    {gaps.gaps?.map((g: any, i: number) => {
                      const pCfg = PRIORITY_CFG[g.priority] || PRIORITY_CFG['LOW'];
                      return (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-800/30 hover:border-slate-700 transition-colors duration-200">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${g.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <span className="text-sm text-slate-300 flex-1 font-mono text-xs">{g.desc}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${pCfg.bg} ${pCfg.text} ${pCfg.border} shrink-0`}>{g.type}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Mutations ── */}
                {activeView === 'mutations' && mutations && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-emerald-400">{mutations.killed}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Killed</div>
                      </div>
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-red-400">{mutations.survived}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Survived</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-purple-400">{mutations.mutation_score}%</div>
                        <div className="text-[10px] text-slate-500 mt-1">Kill Rate</div>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all duration-1000"
                        style={{ width: `${mutations.mutation_score}%` }} />
                    </div>
                    {mutations.surviving_mutants?.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-800/30 hover:border-slate-700 transition-colors">
                        <span className="text-xs text-slate-500 font-mono w-8 shrink-0">L{m.line}</span>
                        <span className="text-sm text-slate-300 flex-1">{m.description}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold shrink-0">{m.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Search className="w-10 h-10 text-purple-400 animate-pulse" />
                  <p className="text-slate-400 text-sm font-semibold">Analyzing code...</p>
                </div>
              ) : (
                <div className="text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto mb-5">
                    <Microscope className="w-7 h-7 text-slate-600" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Paste code and analyze</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Get complexity scores, behavior maps, coverage gaps, and mutation analysis in one run.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
