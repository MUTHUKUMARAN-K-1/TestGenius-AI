import { useState, useEffect, useRef } from 'react';
import {
  Search, Zap, CheckCircle, RefreshCw, Map,
  Play, Pause, Trash2, Terminal, ChevronRight,
  Circle, ArrowDown,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ── Agent definitions ── */
const AGENTS = [
  { id: 'Orchestrator', label: 'Orchestrator',  icon: Play,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  { id: 'Analyzer',     label: 'Analyzer',      icon: Search,      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)' },
  { id: 'Generator',    label: 'Generator',     icon: Zap,         color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)' },
  { id: 'Validator',    label: 'Validator',      icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)' },
  { id: 'Refiner',      label: 'Refiner',       icon: RefreshCw,   color: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)' },
  { id: 'Mapper',       label: 'Mapper',        icon: Map,         color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)' },
];

const STATUS_COLORS: Record<string, string> = {
  success: '#22c55e',
  running: '#3b82f6',
  warning: '#f59e0b',
  error:   '#ef4444',
  info:    '#94a3b8',
};

interface LogEntry {
  ts: string;
  agent: string;
  event: string;
  detail: string;
  status: string;
}

/* ── SVG connector helper ── */
function Connector({ from, to, color }: { from: string; to: string; color: string }) {
  return null; // We use CSS connectors instead
}

export function WorkflowPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [polling, setPolling] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Poll logs
  useEffect(() => {
    if (!polling) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/v1/pipeline/logs?since=0`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch {}
    }, 1500);
    return () => clearInterval(iv);
  }, [polling]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = async () => {
    try {
      await fetch(`${API}/api/v1/pipeline/logs`, { method: 'DELETE' });
      setLogs([]);
    } catch {}
  };

  // Determine agent status from logs
  const getAgentStatus = (agentId: string): { status: string; lastEvent: string } => {
    const agentLogs = logs.filter(l => l.agent === agentId);
    if (agentLogs.length === 0) return { status: 'idle', lastEvent: '' };
    const last = agentLogs[agentLogs.length - 1];
    // Derive effective status: events like 'done', 'converged', 'pipeline_complete' mean success
    let effectiveStatus = last.status;
    const doneEvents = ['done', 'converged', 'no_weaknesses', 'pipeline_complete', 'max_iterations', 'fixed'];
    if (doneEvents.some(e => last.event?.includes(e))) {
      effectiveStatus = 'success';
    }
    return { status: effectiveStatus, lastEvent: last.event };
  };

  const filteredLogs = selectedAgent
    ? logs.filter(l => l.agent === selectedAgent)
    : logs;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
              <Play className="w-4 h-4 text-amber-400" />
            </div>
            Multi-Agent Workflow
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time pipeline visualization • n8n-style agent orchestration</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPolling(!polling)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              polling
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {polling ? <><Circle className="w-2.5 h-2.5 fill-emerald-400" /> Live</> : <><Pause className="w-3 h-3" /> Paused</>}
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* ═══ Workflow Canvas ═══ */}
      <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-8 mb-6 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Orchestrator at top center */}
        <div className="relative z-10">
          {/* Top: Orchestrator */}
          <div className="flex justify-center mb-2">
            <AgentNode
              agent={AGENTS[0]}
              status={getAgentStatus('Orchestrator')}
              selected={selectedAgent === 'Orchestrator'}
              onClick={() => setSelectedAgent(selectedAgent === 'Orchestrator' ? null : 'Orchestrator')}
              isOrchestrator
            />
          </div>

          {/* Connector lines from orchestrator to agents */}
          <div className="flex justify-center mb-2">
            <svg width="720" height="50" viewBox="0 0 720 50" className="overflow-visible">
              {[0, 1, 2, 3, 4].map((i) => {
                const startX = 360;
                const endX = 72 + i * 144;
                return (
                  <path
                    key={i}
                    d={`M ${startX} 0 C ${startX} 30, ${endX} 20, ${endX} 50`}
                    stroke={AGENTS[i + 1].color}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="6 4"
                    opacity="0.45"
                    className="animate-flow-line"
                  />
                );
              })}
            </svg>
          </div>

          {/* Bottom row: 5 agents */}
          <div className="grid grid-cols-5 gap-4">
            {AGENTS.slice(1).map((agent) => (
              <AgentNode
                key={agent.id}
                agent={agent}
                status={getAgentStatus(agent.id)}
                selected={selectedAgent === agent.id}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Agent Logs Terminal ═══ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Log header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800/60 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-300">Agent Logs</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400">
              {filteredLogs.length}
            </span>
          </div>
          {/* Agent filter pills */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedAgent(null)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                !selectedAgent
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All
            </button>
            {AGENTS.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAgent(selectedAgent === a.id ? null : a.id)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  selectedAgent === a.id
                    ? 'text-white border'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                style={selectedAgent === a.id ? { background: `${a.bg}`, borderColor: a.border, color: a.color } : {}}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log entries */}
        <div className="max-h-[340px] overflow-y-auto p-1" id="workflow-log-container">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <Terminal className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-sm font-medium">No agent logs yet</p>
              <p className="text-xs mt-1">Run a pipeline from the Generate page to see real-time logs here</p>
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const agent = AGENTS.find(a => a.id === log.agent);
              const statusColor = STATUS_COLORS[log.status] || STATUS_COLORS.info;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-2 hover:bg-slate-800/40 rounded-lg transition-colors group"
                >
                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-slate-600 w-[130px] shrink-0 pt-0.5">
                    {log.ts}
                  </span>
                  {/* Status dot */}
                  <div className="pt-1.5 shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}40` }}
                    />
                  </div>
                  {/* Agent badge */}
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                    style={{
                      background: agent?.bg || 'rgba(148,163,184,0.1)',
                      color: agent?.color || '#94a3b8',
                      border: `1px solid ${agent?.border || 'rgba(148,163,184,0.2)'}`,
                    }}
                  >
                    {log.agent}
                  </span>
                  {/* Event */}
                  <span className="text-xs font-semibold text-slate-300 shrink-0">
                    {log.event}
                  </span>
                  {/* Detail */}
                  <span className="text-xs text-slate-500 truncate">
                    {log.detail}
                  </span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}


/* ── Agent Node Component ── */
function AgentNode({
  agent,
  status,
  selected,
  onClick,
  isOrchestrator = false,
}: {
  agent: typeof AGENTS[0];
  status: { status: string; lastEvent: string };
  selected: boolean;
  onClick: () => void;
  isOrchestrator?: boolean;
}) {
  const Icon = agent.icon;
  const isRunning = status.status === 'running';
  const isSuccess = status.status === 'success';
  const isIdle = status.status === 'idle';

  return (
    <button
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-300 ${
        isOrchestrator ? 'w-[280px]' : 'w-full'
      }`}
    >
      <div
        className={`relative rounded-2xl p-5 border-2 transition-all duration-300 ${
          selected ? 'scale-[1.03]' : 'hover:scale-[1.02]'
        }`}
        style={{
          background: isOrchestrator
            ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.04) 100%)'
            : `linear-gradient(135deg, ${agent.bg} 0%, transparent 100%)`,
          borderColor: selected ? agent.color : agent.border,
          boxShadow: selected
            ? `0 0 24px ${agent.color}20, 0 0 48px ${agent.color}10`
            : isRunning
            ? `0 0 16px ${agent.color}15`
            : 'none',
        }}
      >
        {/* Pulse ring for running state */}
        {isRunning && (
          <div
            className="absolute inset-0 rounded-2xl animate-ping-slow"
            style={{ border: `2px solid ${agent.color}`, opacity: 0.2 }}
          />
        )}

        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: agent.bg, border: `1px solid ${agent.border}` }}
          >
            <Icon className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} style={{ color: agent.color }} />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-bold text-white">{agent.label}</div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {status.lastEvent || (isOrchestrator ? 'Coordinates all agents' : 'Waiting for input')}
            </div>
          </div>
        </div>

        {/* Status footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: `${agent.color}15` }}>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
              style={{ background: isRunning ? '#3b82f6' : isSuccess ? '#22c55e' : '#475569' }}
            />
            <span className="text-[10px] font-semibold" style={{ color: isRunning ? '#3b82f6' : isSuccess ? '#22c55e' : '#64748b' }}>
              {isRunning ? 'Running' : isSuccess ? 'Done' : 'Idle'}
            </span>
          </div>
          {isOrchestrator && (
            <span className="text-[10px] text-slate-600">5 agents connected</span>
          )}
        </div>
      </div>
    </button>
  );
}
