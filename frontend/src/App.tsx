import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/Dashboard';
import { ProjectionPage } from './pages/ProjectionPage';
import { RecurringPage } from './pages/RecurringPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { Wallet, Sun, Moon } from 'lucide-react';
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

type Page = 'dashboard' | 'transactions' | 'search' | 'projection' | 'recurring' | 'settings';

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
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <QueryClientProvider client={queryClient}>
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
              <a
                href="#"
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
              >
                Dashboard
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentPage('transactions'); }}
              >
                Transações
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === 'search' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}
              >
                Buscar
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === 'projection' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentPage('projection'); }}
              >
                Projeção
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === 'recurring' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentPage('recurring'); }}
              >
                Recorrentes
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentPage('settings'); }}
              >
                Configurações
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="main-content">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'transactions' && <TransactionsPage />}
          {currentPage === 'search' && <SearchPage />}
          {currentPage === 'projection' && <ProjectionPage />}
          {currentPage === 'recurring' && <RecurringPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;


