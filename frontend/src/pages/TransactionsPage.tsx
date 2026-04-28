import { useState, useMemo } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from '../components/TransactionForm';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '../i18n';
import {
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    Pencil,
    Trash2,
    Plus,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import type { Transaction } from '../types';
import { SpendingByCategory } from '../components/SpendingByCategory';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (t: Transaction) => void;
    onDelete: (id: number) => void;
}

function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
    const isIncome = transaction.type === 'INCOME';
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr + 'T00:00:00');
        const locale = language === 'pt-BR' ? ptBR : enUS;
        const pattern = language === 'pt-BR' ? "dd 'de' MMMM" : "MMMM dd";
        return format(date, pattern, { locale });
    };

    const getRecurrenceLabel = (recurrence: string) => {
        switch (recurrence) {
            case 'DAILY': return t.transactions.form.daily;
            case 'WEEKLY': return t.transactions.form.weekly;
            case 'MONTHLY': return t.transactions.form.monthly;
            case 'YEARLY': return t.transactions.form.yearly;
            default: return '';
        }
    };

    return (
        <div className="transaction-item">
            <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
            </div>

            <div className="transaction-info">
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-meta">
                    <span>{formatDate(transaction.effectiveDate)}</span>
                    {transaction.category && (
                        <>
                            <span>•</span>
                            <span style={{ color: transaction.category.color || undefined }}>
                                {transaction.category.name}
                            </span>
                        </>
                    )}
                    {transaction.recurrence !== 'NONE' && (
                        <>
                            <span>•</span>
                            <span>{getRecurrenceLabel(transaction.recurrence)}</span>
                        </>
                    )}
                </div>
            </div>

            <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
            </div>

            <div className="transaction-actions" style={{ opacity: 1 }}>
                <button className="btn btn-icon btn-ghost" onClick={() => onEdit(transaction)} title={t.common.edit}>
                    <Pencil size={16} />
                </button>
                <button className="btn btn-icon btn-ghost" onClick={() => onDelete(transaction.id)} title={t.common.delete}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

function DiffBadge({ current, previous, positiveIsGood, selectedMonth, language }: {
    current: number;
    previous: number;
    positiveIsGood: boolean;
    selectedMonth: number | null;
    language: string;
}) {
    if (previous === 0) return null;
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    const isUp = pct > 0;
    const isGood = positiveIsGood ? isUp : !isUp;
    const color = isGood ? 'var(--color-success)' : 'var(--color-danger)';
    const arrow = isUp ? '↑' : '↓';
    const periodLabel = selectedMonth === null
        ? (language === 'pt-BR' ? 'vs ano anterior' : 'vs prev year')
        : (language === 'pt-BR' ? 'vs mês anterior' : 'vs prev month');

    return (
        <div style={{ fontSize: '0.75rem', color, marginTop: '4px', fontWeight: 600 }}>
            {arrow}{Math.abs(pct).toFixed(1)}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{periodLabel}</span>
        </div>
    );
}

export function TransactionsPage() {
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(currentDate.getMonth());
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const { data: allTransactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    // Gera lista de anos disponíveis baseada nas transações e no ano atual
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(currentDate.getFullYear()); // Garante ano atual

        // Adiciona anos das transações existentes
        if (allTransactions) {
            allTransactions.forEach(t => {
                // effectiveDate é string "YYYY-MM-DD"
                const year = parseInt(t.effectiveDate.substring(0, 4));
                years.add(year);
            });
        }

        // Garante pelo menos os últimos 5 anos para histórico
        for (let i = 1; i < 6; i++) {
            years.add(currentDate.getFullYear() - i);
        }

        return Array.from(years).sort((a, b) => b - a);
    }, [currentDate, allTransactions]);

    // Filtra transações pelo mês/ano selecionado
    const filteredTransactions = useMemo(() => {
        if (!allTransactions) return [];

        if (selectedMonth === null) {
            // Filtro por ano inteiro
            const startDate = new Date(selectedYear, 0, 1);
            const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

            return allTransactions.filter((t) => {
                const txDate = parseISO(t.effectiveDate);
                return txDate >= startDate && txDate <= endDate;
            }).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
        }

        const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
        const endDate = endOfMonth(new Date(selectedYear, selectedMonth));

        return allTransactions.filter((t) => {
            const txDate = parseISO(t.effectiveDate);
            return txDate >= startDate && txDate <= endDate;
        }).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    }, [allTransactions, selectedYear, selectedMonth]);

    // Calcula totais
    const totals = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    // Dados mensais para o gráfico anual
    const yearlyChartData = useMemo(() => {
        if (!allTransactions || selectedMonth !== null) return [];
        const locale = language === 'pt-BR' ? ptBR : enUS;
        return Array.from({ length: 12 }, (_, monthIndex) => {
            const monthTxs = allTransactions.filter(t => {
                const d = parseISO(t.effectiveDate);
                return d.getFullYear() === selectedYear && d.getMonth() === monthIndex;
            });
            const income = monthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
            const expense = monthTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
            return {
                month: format(new Date(selectedYear, monthIndex, 1), 'MMM', { locale }),
                monthIndex,
                income,
                expense,
                balance: income - expense,
            };
        });
    }, [allTransactions, selectedYear, selectedMonth, language]);

    // Totais do período anterior para comparativo
    const previousTotals = useMemo(() => {
        if (!allTransactions) return null;
        let txs: typeof allTransactions;
        if (selectedMonth === null) {
            const prevYear = selectedYear - 1;
            txs = allTransactions.filter(t => parseISO(t.effectiveDate).getFullYear() === prevYear);
        } else {
            const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
            const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
            txs = allTransactions.filter(t => {
                const d = parseISO(t.effectiveDate);
                return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
            });
        }
        const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { income, expense };
    }, [allTransactions, selectedYear, selectedMonth]);

    const handleDelete = async (id: number) => {
        if (confirm(t.transactions.confirmDelete)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    // Gera nomes dos meses baseados no locale
    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(selectedYear, i, 1);
            return format(d, 'MMMM', { locale: language === 'pt-BR' ? ptBR : enUS });
        });
    }, [language, selectedYear]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={28} />
                    {t.transactions.title}
                </h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    {t.dashboard.newTransaction}
                </button>
            </div>

            {/* Filtros de ano/mês */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {/* Seletor de ano */}
                <div className="type-toggle">
                    {availableYears.slice(0, 4).map((year) => (
                        <button
                            key={year}
                            className={`type-toggle-btn ${selectedYear === year ? 'active income' : ''}`}
                            onClick={() => setSelectedYear(year)}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Meses */}
            <div className="grid-months">
                <button
                    className={`btn ${selectedMonth === null ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setSelectedMonth(null)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', textTransform: 'capitalize' }}
                >
                    {language === 'pt-BR' ? 'Ano' : 'Year'}
                </button>
                {monthNames.map((month, index) => (
                    <button
                        key={month}
                        className={`btn ${selectedMonth === index ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setSelectedMonth(index)}
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', textTransform: 'capitalize' }}
                    >
                        {month.slice(0, 3)}
                    </button>
                ))}
            </div>

            {/* Gráfico anual: receita vs despesa por mês */}
            {selectedMonth === null && yearlyChartData.some(d => d.income > 0 || d.expense > 0) && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">
                            {language === 'pt-BR' ? `Receitas vs Despesas — ${selectedYear}` : `Income vs Expenses — ${selectedYear}`}
                        </h3>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: totals.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        }}>
                            {totals.balance >= 0
                                ? (language === 'pt-BR' ? `Sobrou ${formatCurrency(totals.balance)}` : `Saved ${formatCurrency(totals.balance)}`)
                                : (language === 'pt-BR' ? `Gastou ${formatCurrency(Math.abs(totals.balance))} a mais` : `Overspent ${formatCurrency(Math.abs(totals.balance))}`)}
                        </span>
                    </div>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyChartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                                onClick={(e) => {
                                    if (e?.activePayload?.[0]) {
                                        const idx = (e.activePayload[0].payload as { monthIndex: number }).monthIndex;
                                        setSelectedMonth(idx);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                                    tickFormatter={(v: number) => {
                                        if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                                        return String(v);
                                    }}
                                    width={45}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                    }}
                                    formatter={(value: number, name: string) => [
                                        formatCurrency(value),
                                        name === 'income'
                                            ? (language === 'pt-BR' ? 'Receita' : 'Income')
                                            : (language === 'pt-BR' ? 'Despesa' : 'Expense'),
                                    ]}
                                />
                                <Legend
                                    formatter={(value) =>
                                        value === 'income'
                                            ? (language === 'pt-BR' ? 'Receita' : 'Income')
                                            : (language === 'pt-BR' ? 'Despesa' : 'Expense')
                                    }
                                />
                                <ReferenceLine y={0} stroke="var(--border-color)" />
                                <Bar dataKey="income" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                <Bar dataKey="expense" fill="var(--color-danger)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                        {language === 'pt-BR' ? 'Clique em um mês para filtrar' : 'Click a month to filter'}
                    </p>
                </div>
            )}

            {/* Gráfico de Gastos (mostra se houver dados) */}
            <div style={{ marginBottom: '1.5rem' }}>
                <SpendingByCategory transactions={filteredTransactions} isLoading={isLoading} />
            </div>

            {/* Cards de resumo */}
            <div className="grid-summary-3">
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <TrendingUp size={18} color="var(--color-success)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.dashboard.income}</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        {formatCurrency(totals.income)}
                    </div>
                    {previousTotals && previousTotals.income > 0 && (
                        <DiffBadge current={totals.income} previous={previousTotals.income} positiveIsGood={true} selectedMonth={selectedMonth} language={language} />
                    )}
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <TrendingDown size={18} color="var(--color-danger)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.dashboard.expenses}</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                        {formatCurrency(totals.expense)}
                    </div>
                    {previousTotals && previousTotals.expense > 0 && (
                        <DiffBadge current={totals.expense} previous={previousTotals.expense} positiveIsGood={false} selectedMonth={selectedMonth} language={language} />
                    )}
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {selectedMonth === null
                                ? (language === 'pt-BR' ? 'Saldo do Ano' : 'Year Balance')
                                : (language === 'pt-BR' ? 'Saldo do Mês' : 'Month Balance')}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: totals.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                        {formatCurrency(totals.balance)}
                    </div>
                    {previousTotals && (previousTotals.income > 0 || previousTotals.expense > 0) && (() => {
                        const prevBalance = previousTotals.income - previousTotals.expense;
                        return prevBalance !== 0
                            ? <DiffBadge current={totals.balance} previous={prevBalance} positiveIsGood={true} selectedMonth={selectedMonth} language={language} />
                            : null;
                    })()}
                </div>
            </div>

            {/* Lista de transações */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title" style={{ textTransform: 'capitalize' }}>
                        {selectedMonth !== null ? monthNames[selectedMonth] : (language === 'pt-BR' ? 'Ano' : 'Year')} {selectedYear} ({filteredTransactions.length} {language === 'pt-BR' ? 'transações' : 'transactions'})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <p>{t.common.noData}</p>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {filteredTransactions.map((t) => (
                            <TransactionItem
                                key={t.id}
                                transaction={t}
                                onEdit={setEditingTransaction}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <TransactionForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => setShowForm(false)}
                />
            )}

            {editingTransaction && (
                <TransactionForm
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    onSuccess={() => setEditingTransaction(null)}
                />
            )}
        </div>
    );
}

