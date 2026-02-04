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
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <TrendingDown size={18} color="var(--color-danger)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.dashboard.expenses}</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                        {formatCurrency(totals.expense)}
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {language === 'pt-BR' ? 'Saldo do Mês' : 'Month Balance'}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: totals.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                        {formatCurrency(totals.balance)}
                    </div>
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

