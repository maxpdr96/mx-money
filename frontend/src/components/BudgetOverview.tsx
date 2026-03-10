import { useTransactions, useCategories } from '../hooks/useApi';
import { useLanguage } from '../i18n';
import { Wallet, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

export function BudgetOverview() {
    const { data: transactions, isLoading: loadingTransactions } = useTransactions();
    const { data: categories, isLoading: loadingCategories } = useCategories();
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    const budgetData = useMemo(() => {
        if (!transactions || !categories) return [];

        // Filtra transações do mês atual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.effectiveDate + 'T00:00:00');
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear && t.type === 'EXPENSE';
        });

        // Só processa categorias que têm orçamento definido
        return categories
            .filter(cat => cat.monthlyBudget && cat.monthlyBudget > 0)
            .map(cat => {
                const spent = currentMonthTransactions
                    .filter(t => t.category?.id === cat.id)
                    .reduce((sum, t) => sum + t.amount, 0);

                const budget = cat.monthlyBudget || 0;
                const percentage = Math.min((spent / budget) * 100, 100);
                const isOverBudget = spent > budget;
                const isWarning = spent > budget * 0.8;

                return {
                    ...cat,
                    spent,
                    percentage,
                    isOverBudget,
                    isWarning,
                    remaining: Math.max(0, budget - spent)
                };
            })
            .sort((a, b) => b.percentage - a.percentage);
    }, [transactions, categories]);

    if (loadingTransactions || loadingCategories) {
        return (
            <div className="card">
                <div className="loading"><div className="spinner"></div></div>
            </div>
        );
    }

    if (budgetData.length === 0) {
        return null; // Não mostra nada se não houver orçamentos definidos
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <Wallet size={18} />
                    {t.dashboard.budgets}
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {budgetData.map((item) => (
                    <div key={item.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {item.name}
                                    {item.isOverBudget && <AlertTriangle size={14} color="var(--color-danger)" />}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {t.dashboard.budgetUsed.replace('$1', formatCurrency(item.spent)).replace('$2', formatCurrency(item.monthlyBudget || 0))}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ 
                                    fontSize: '0.85rem', 
                                    fontWeight: 700,
                                    color: item.isOverBudget ? 'var(--color-danger)' : item.isWarning ? 'var(--color-warning)' : 'var(--color-success)'
                                }}>
                                    {item.percentage.toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        {/* Barra de Progresso */}
                        <div style={{ 
                            height: '8px', 
                            backgroundColor: 'var(--bg-tertiary)', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ 
                                width: `${item.percentage}%`, 
                                height: '100%', 
                                backgroundColor: item.isOverBudget ? 'var(--color-danger)' : item.isWarning ? 'var(--color-warning)' : 'var(--color-primary)',
                                borderRadius: '4px',
                                transition: 'width 0.5s ease-out, background-color 0.3s'
                            }} />
                        </div>

                        {item.isOverBudget && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', marginTop: '4px', fontWeight: 500 }}>
                                Excedeu em {formatCurrency(item.spent - (item.monthlyBudget || 0))}
                            </div>
                        )}
                        {!item.isOverBudget && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {t.dashboard.remaining}: {formatCurrency(item.remaining)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
