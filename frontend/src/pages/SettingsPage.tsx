import { useState, useEffect } from 'react';
import { Bot, Settings, Info, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Row({ label, value, mono = false, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : 'font-medium'} ${accent || 'text-slate-200'} truncate max-w-[280px]`}>{value}</span>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/v1/provider`)
      .then(r => r.json())
      .then(d => { setProvider(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">LLM provider configuration and system info</p>
      </div>

      <div className="space-y-4">

        {/* LLM Provider */}
        <Card icon={Bot} title="LLM Provider">
          {loading ? (
            <div className="py-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-5 rounded-lg" />)}
            </div>
          ) : provider ? (
            <div>
              <Row label="Provider"  value={provider.provider}  />
              <Row label="Model"     value={provider.model}     mono />
              <Row label="Base URL"  value={provider.base_url}  mono />
              <Row label="Max Tokens" value={String(provider.max_tokens)} />
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-400">Status</span>
                {provider.configured ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                    <XCircle className="w-4 h-4" /> Not configured
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
              <XCircle className="w-8 h-8 text-slate-700" />
              <span>Could not reach backend</span>
              <span className="text-xs text-slate-600">Make sure backend is running on {API}</span>
            </div>
          )}
        </Card>

        {/* Pipeline */}
        <Card icon={Settings} title="Pipeline Settings">
          <Row label="Max Iterations"    value="5" />
          <Row label="Quality Threshold" value="Grade A (85%+)" />
          <Row label="Mutation Testing"  value="Enabled — real execution" accent="text-emerald-400" />
          <Row label="Syntax Validation" value="Enabled — AST parse"     accent="text-emerald-400" />
          <Row label="Quality Scoring"   value="5 dimensions, A–D grade" />
        </Card>

        {/* System */}
        <Card icon={Info} title="System">
          <Row label="Version"        value="v2.0.0" />
          <Row label="Pipeline"       value="multi-agent-iterative-v2" mono />
          <Row label="Research Basis" value="MuTAP (ISSTA'23) + HITS (ASE'24)" />
          <Row label="Agents"         value="Analyzer → Generator → Validator → Refiner → Mapper" />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-400">API Docs</span>
            <a
              href={`${API}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 cursor-pointer"
            >
              {API}/docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Card>

        {/* Env hint */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Configure via .env</p>
          <pre className="text-xs font-mono text-slate-400 leading-6 bg-black/40 rounded-xl p-4 border border-slate-800">
{`LLM_BASE_URL=https://api.tokenrouter.com/v1
LLM_API_KEY=your_key_here
LLM_MODEL=anthropic/claude-sonnet-4-5
LLM_MAX_TOKENS=8192
LLM_TEMPERATURE=0.3`}
          </pre>
          <p className="text-[11px] text-slate-600 mt-3">Restart backend after changes. Supports any OpenAI-compatible provider.</p>
        </div>

      </div>
    </div>
  );
}
