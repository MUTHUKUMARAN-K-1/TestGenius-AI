import { useState, useEffect } from 'react';
import { Zap, Search, Clock, Settings, Workflow } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { GeneratePage } from './pages/GeneratePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkflowPage } from './pages/WorkflowPage';

type Page = 'landing' | 'generate' | 'analyze' | 'history' | 'settings' | 'workflow';

function useHashRouter(): [Page, (p: Page) => void] {
  const getPage = (): Page => {
    const hash = window.location.hash.slice(1) || 'landing';
    if (['landing', 'generate', 'analyze', 'history', 'settings', 'workflow'].includes(hash)) return hash as Page;
    return 'landing';
  };
  const [page, setPage] = useState<Page>(getPage());
  useEffect(() => {
    const handler = () => setPage(getPage());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const navigate = (p: Page) => {
    window.location.hash = p === 'landing' ? '' : p;
    setPage(p);
    window.scrollTo(0, 0);
  };
  return [page, navigate];
}

const NAV_LINKS = [
  { id: 'generate' as Page, label: 'Generate', icon: Zap },
  { id: 'workflow' as Page, label: 'Workflow', icon: Workflow },
  { id: 'analyze'  as Page, label: 'Analyze',  icon: Search },
  { id: 'history'  as Page, label: 'History',  icon: Clock },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
];

function Navbar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  if (page === 'landing') return null;
  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          <img src="/logo.png" alt="TestGenius AI" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-white text-sm tracking-tight">TestGenius <span className="text-blue-400">AI</span></span>
        </button>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                page === id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [page, navigate] = useHashRouter();
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <Navbar page={page} onNavigate={navigate} />
      <main className="animate-fade-in">
        {page === 'landing'  && <LandingPage onNavigate={navigate} />}
        {page === 'generate' && <GeneratePage />}
        {page === 'workflow' && <WorkflowPage />}
        {page === 'analyze'  && <AnalyzePage />}
        {page === 'history'  && <HistoryPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
