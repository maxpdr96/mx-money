import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/Dashboard';
import { ProjectionPage } from './pages/ProjectionPage';
import { RecurringPage } from './pages/RecurringPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CalendarPage } from './pages/CalendarPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SearchPage } from './pages/SearchPage';
import { ImportPage } from './pages/ImportPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { LanguageProvider, useLanguage } from './i18n';
import {
  Wallet,
  Sun,
  Moon,
  LayoutDashboard,
  ReceiptText,
  CalendarDays,
  Search,
  LineChart,
  Calculator,
  Repeat,
  Brain,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import { APP_VERSION } from './version';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

type Page = 'dashboard' | 'transactions' | 'calendar' | 'search' | 'projection' | 'simulator' | 'recurring' | 'reports' | 'import' | 'settings';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setIsDark(!isDark)}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { t } = useLanguage();
  const navItems = [
    { page: 'dashboard' as const, label: t.nav.dashboard, icon: LayoutDashboard, hint: 'Visão geral dos saldos' },
    { page: 'transactions' as const, label: t.nav.transactions, icon: ReceiptText, hint: 'Lançamentos e edição' },
    { page: 'calendar' as const, label: t.nav.calendar, icon: CalendarDays, hint: 'Agenda financeira' },
    { page: 'search' as const, label: t.nav.search, icon: Search, hint: 'Busca de transações' },
    { page: 'projection' as const, label: t.nav.projection, icon: LineChart, hint: 'Projeções futuras' },
    { page: 'simulator' as const, label: t.nav.simulator, icon: Calculator, hint: 'Simulações rápidas' },
    { page: 'recurring' as const, label: t.nav.recurring, icon: Repeat, hint: 'Lançamentos recorrentes' },
    { page: 'reports' as const, label: t.reports.title, icon: Brain, hint: 'Análises com IA' },
    { page: 'import' as const, label: t.csvImport.title, icon: FileSpreadsheet, hint: 'Importação de CSV' },
    { page: 'settings' as const, label: t.nav.settings, icon: Settings, hint: 'Preferências do app' },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <a href="#" className="logo" onClick={() => setCurrentPage('dashboard')}>
            <div className="logo-icon">
              <Wallet size={20} color="white" />
            </div>
            MX Money
          </a>
          <nav className="nav">
            <div className="nav-links">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.page}
                    href="#"
                    className={`nav-link ${currentPage === item.page ? 'active' : ''}`}
                    title={item.hint}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(item.page); }}
                  >
                    <Icon size={15} />
                    <span className="nav-link-text">{item.label}</span>
                  </a>
                );
              })}
            </div>
            <div className="nav-utils">
              <span className="app-version-badge" title="Frontend version">
                v{APP_VERSION}
              </span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'transactions' && <TransactionsPage />}
        {currentPage === 'calendar' && <CalendarPage />}
        {currentPage === 'search' && <SearchPage />}
        {currentPage === 'projection' && <ProjectionPage />}
        {currentPage === 'simulator' && <SimulatorPage />}
        {currentPage === 'recurring' && <RecurringPage />}
        {currentPage === 'reports' && <ReportsPage />}
        {currentPage === 'import' && <ImportPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;

