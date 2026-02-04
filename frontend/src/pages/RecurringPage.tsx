import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from '../components/TransactionForm';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '../i18n';
import { Repeat, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react';
import type { Transaction, RecurrenceType } from '../types';

const RECURRENCE_COLORS: Record<RecurrenceType, string> = {
    NONE: '#64748b',
    DAILY: '#ef4444',
    WEEKLY: '#f97316',
    MONTHLY: '#22c55e',
    YEARLY: '#6366f1',
};

const RECURRENCE_TABS: RecurrenceType[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

interface RecurringItemProps {
    transaction: Transaction;
    onEdit: (t: Transaction) => void;
    onDelete: (id: number) => void;
}

function RecurringItem({ transaction, onEdit, onDelete }: RecurringItemProps) {
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
        const pattern = language === 'pt-BR' ? "dd 'de' MMM" : "MMM dd";
        return format(date, pattern, { locale });
    };

    return (
        <div className="transaction-item">
            <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
            </div>

            <div className="transaction-info">
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-meta">
                    <span>{language === 'pt-BR' ? 'Desde' : 'Since'} {formatDate(transaction.effectiveDate)}</span>
                    {transaction.category && (
                        <>
                            <span>•</span>
                            <span style={{ color: transaction.category.color || undefined }}>
                                {transaction.category.name}
                            </span>
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

export function RecurringPage() {
    const { data: transactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();
    const [activeTab, setActiveTab] = useState<RecurrenceType>('MONTHLY');
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    const getRecurrenceLabel = (recurrence: RecurrenceType | string) => {
        switch (recurrence) {
            case 'NONE': return t.transactions.form.none;
            case 'DAILY': return t.transactions.form.daily;
            case 'WEEKLY': return t.transactions.form.weekly;
            case 'MONTHLY': return t.transactions.form.monthly;
            case 'YEARLY': return t.transactions.form.yearly;
            default: return '';
        }
    };

    // Filtra apenas transações recorrentes
    const recurringTransactions = transactions?.filter((t) => t.recurrence !== 'NONE') || [];

    // Agrupa por tipo de recorrência
    const byRecurrence = RECURRENCE_TABS.reduce((acc, type) => {
        acc[type] = recurringTransactions.filter((t) => t.recurrence === type);
        return acc;
    }, {} as Record<RecurrenceType, Transaction[]>);

    // Dados para o gráfico
    const chartData = RECURRENCE_TABS.map((type) => ({
        name: getRecurrenceLabel(type),
        value: byRecurrence[type]?.length || 0,
        color: RECURRENCE_COLORS[type],
    })).filter((d) => d.value > 0);

    const handleDelete = async (id: number) => {
        if (confirm(t.transactions.confirmDelete)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const activeTransactions = byRecurrence[activeTab] || [];

    // Calcula totais por tipo
    const totalByTab = (type: RecurrenceType) => {
        const txs = byRecurrence[type] || [];
        const income = txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { income, expense, balance: income - expense };
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Repeat size={28} />
                    {t.recurring.title}
                </h1>
            </div>

            {/* Cards de Resumo + Gráfico */}
            <div className="grid-recurring-layout">
                {/* Cards por tipo */}
                <div className="grid-recurring-cards">
                    {RECURRENCE_TABS.map((type) => {
                        const count = byRecurrence[type]?.length || 0;
                        const totals = totalByTab(type);
                        return (
                            <div
                                key={type}
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    borderColor: activeTab === type ? RECURRENCE_COLORS[type] : undefined,
                                    borderWidth: activeTab === type ? '2px' : undefined,
                                }}
                                onClick={() => setActiveTab(type)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: RECURRENCE_COLORS[type],
                                        }}
                                    />
                                    <span style={{ fontWeight: 600 }}>{getRecurrenceLabel(type)}</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {language === 'pt-BR' ? 'transações' : 'transactions'}
                                </div>
                                {count > 0 && (
                                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                        <span style={{ color: 'var(--color-success)' }}>+{formatCurrency(totals.income)}</span>
                                        {' / '}
                                        <span style={{ color: 'var(--color-danger)' }}>-{formatCurrency(totals.expense)}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Gráfico de pizza */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">{(language === 'pt-BR' ? 'Distribuição' : 'Distribution')}</h3>
                    </div>
                    {chartData.length === 0 ? (
                        <div className="empty-state">
                            <p>{t.recurring.noRecurring}</p>
                        </div>
                    ) : (
                        <div style={{ height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '2px solid var(--color-primary)',
                                            borderRadius: '8px',
                                            color: '#0f172a',
                                        }}
                                    />
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        iconType="circle"
                                        formatter={(value) => (
                                            <span style={{ color: 'var(--text-primary)', fontSize: '0.75rem' }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="type-toggle" style={{ marginBottom: '1rem' }}>
                {RECURRENCE_TABS.map((type) => (
                    <button
                        key={type}
                        className={`type-toggle-btn ${activeTab === type ? 'active income' : ''}`}
                        onClick={() => setActiveTab(type)}
                        style={{
                            borderColor: activeTab === type ? RECURRENCE_COLORS[type] : undefined,
                            color: activeTab === type ? RECURRENCE_COLORS[type] : undefined,
                            backgroundColor: activeTab === type ? `${RECURRENCE_COLORS[type]}20` : undefined,
                        }}
                    >
                        {getRecurrenceLabel(type)} ({byRecurrence[type]?.length || 0})
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">{getRecurrenceLabel(activeTab)}</h3>
                </div>

                {isLoading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : activeTransactions.length === 0 ? (
                    <div className="empty-state">
                        <p>{t.common.noData}</p>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {activeTransactions.map((t) => (
                            <RecurringItem
                                key={t.id}
                                transaction={t}
                                onEdit={setEditingTransaction}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

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

