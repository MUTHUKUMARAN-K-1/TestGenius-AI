import { useState, useEffect } from 'react';
import { Clock, Copy, Check, ChevronRight } from 'lucide-react';

const GRADE_CFG: Record<string, { text: string; bg: string; border: string }> = {
  A: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  B: { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  C: { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
  D: { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30'     },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function HistoryPage() {
  const [history, setHistory]   = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('tg_history') || '[]');
    setHistory(h);
    if (h.length) setSelected(h[0]);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(selected?.test_files?.[0]?.code || selected?.test_code || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-white tracking-tight">Generation History</h1>
          <p className="text-slate-500 text-sm mt-1">Previous test generation runs (stored locally)</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-9 h-9 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No history yet</h3>
          <p className="text-slate-500 text-sm max-w-xs">Run the pipeline on the Generate page to see your results here.</p>
        </div>
      </div>
    );
  }

  const grade = selected?.quality?.grade;
  const gradeCfg = grade ? (GRADE_CFG[grade] || GRADE_CFG['B']) : null;

  // QA Stats
  const gradeCount = { A: 0, B: 0, C: 0, D: 0 };
  let totalScore = 0, scoreCount = 0, totalTests = 0, totalCoverage = 0, coverageCount = 0;
  history.forEach(item => {
    const g = item.quality?.grade as string;
    if (g in gradeCount) gradeCount[g as keyof typeof gradeCount]++;
    if (item.quality?.overall) { totalScore += item.quality.overall; scoreCount++; }
    const t = item.syntax_validation?.test_count || item.test_files?.[0]?.num_tests || 0;
    totalTests += t;
    if (item.behavior_coverage?.coverage_pct) { totalCoverage += item.behavior_coverage.coverage_pct; coverageCount++; }
  });
  const avgScore = scoreCount ? Math.round(totalScore / scoreCount) : null;
  const avgCoverage = coverageCount ? Math.round(totalCoverage / coverageCount) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white tracking-tight">Generation History</h1>
        <p className="text-slate-500 text-sm mt-1">{history.length} runs stored locally</p>
      </div>

      {/* QA Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{history.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total Runs</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className={`text-2xl font-black ${avgScore ? (avgScore >= 85 ? 'text-emerald-400' : avgScore >= 70 ? 'text-blue-400' : 'text-amber-400') : 'text-slate-500'}`}>
            {avgScore ?? '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Avg Quality</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{totalTests || '—'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tests Generated</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className={`text-2xl font-black ${avgCoverage ? 'text-emerald-400' : 'text-slate-500'}`}>
            {avgCoverage ? `${avgCoverage}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Avg Coverage</div>
        </div>
      </div>
      {/* Grade distribution */}
      {Object.values(gradeCount).some(v => v > 0) && (
        <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Grade Distribution</span>
          <div className="flex-1 flex gap-2">
            {(Object.entries(gradeCount) as [string, number][]).map(([g, count]) => count > 0 && (
              <div key={g} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${GRADE_CFG[g].bg} ${GRADE_CFG[g].text} ${GRADE_CFG[g].border}`}>
                {g} <span className="opacity-70">×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">

        {/* ── List ── */}
        <div className="flex flex-col gap-1.5 max-h-[680px] overflow-y-auto pr-1">
          {history.map((item, i) => {
            const g = item.quality?.grade;
            const gCfg = g ? (GRADE_CFG[g] || GRADE_CFG['B']) : null;
            const isSelected = selected === item;
            return (
              <button
                key={i}
                onClick={() => setSelected(item)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src="/logo.png" alt="" className="w-3.5 h-3.5 rounded shrink-0 object-cover opacity-70" />
                    <span className={`text-xs font-mono font-semibold truncate ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}>
                      {item.run_id || `Run ${i + 1}`}
                    </span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'}`} />
                </div>
                <div className="text-[11px] text-slate-500 mb-2.5 truncate">{item._input?.slice(0, 60) || 'No description'}</div>
                <div className="flex items-center gap-2">
                  {gCfg && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${gCfg.bg} ${gCfg.text} ${gCfg.border}`}>
                      Grade {g}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-600 font-mono">{item._framework}</span>
                  {item._ts && <span className="text-[10px] text-slate-600 ml-auto">{timeAgo(item._ts)}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Detail ── */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col" style={{ minHeight: 480 }}>
          {selected ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/60 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-slate-300 font-semibold">{selected.run_id}</span>
                  {gradeCfg && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${gradeCfg.bg} ${gradeCfg.text} ${gradeCfg.border}`}>
                      Grade {grade}
                    </span>
                  )}
                  {selected.quality?.overall && (
                    <span className="text-xs text-slate-500">{selected.quality.overall}/100</span>
                  )}
                </div>
                <button
                  onClick={copyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy Code</>}
                </button>
              </div>

              {/* Stats row */}
              {selected.quality && (
                <div className="flex items-center gap-0 border-b border-slate-800">
                  {[
                    { label: 'Tests', value: selected.syntax_validation?.test_count || selected.test_files?.[0]?.num_tests || '—' },
                    { label: 'Coverage', value: selected.behavior_coverage ? `${selected.behavior_coverage.coverage_pct?.toFixed(0)}%` : '—' },
                    { label: 'Mutations', value: selected.mutation_testing ? `${selected.mutation_testing.mutation_score?.toFixed(0)}%` : '—' },
                    { label: 'Time', value: selected.processing_time_ms ? `${(selected.processing_time_ms / 1000).toFixed(1)}s` : '—' },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className={`flex-1 flex flex-col items-center py-3 ${i < arr.length - 1 ? 'border-r border-slate-800' : ''}`}>
                      <div className="text-sm font-black text-white">{value}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Code */}
              <pre className="flex-1 overflow-auto p-5 text-sm text-slate-200 font-mono leading-[1.75]">
                {selected.test_files?.[0]?.code || selected.test_code || 'No code in this run'}
              </pre>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Select a run to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
