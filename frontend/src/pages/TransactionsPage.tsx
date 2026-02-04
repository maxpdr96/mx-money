import { useState, useMemo } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from '../components/TransactionForm';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, "dd 'de' MMMM", { locale: ptBR });
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const RECURRENCE_LABELS: Record<string, string> = {
    NONE: '',
    DAILY: 'Diária',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
};

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (t: Transaction) => void;
    onDelete: (id: number) => void;
}

function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
    const isIncome = transaction.type === 'INCOME';

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
                            <span>{RECURRENCE_LABELS[transaction.recurrence]}</span>
                        </>
                    )}
                </div>
            </div>

            <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
            </div>

            <div className="transaction-actions" style={{ opacity: 1 }}>
                <button className="btn btn-icon btn-ghost" onClick={() => onEdit(transaction)} title="Editar">
                    <Pencil size={16} />
                </button>
                <button className="btn btn-icon btn-ghost" onClick={() => onDelete(transaction.id)} title="Excluir">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export function TransactionsPage() {
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const { data: allTransactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();

    // Gera lista de anos disponíveis (atual até 5 anos atrás)
    const availableYears = useMemo(() => {
        const years = [];
        for (let i = 0; i < 6; i++) {
            years.push(currentDate.getFullYear() - i);
        }
        return years;
    }, [currentDate]);

    // Filtra transações pelo mês/ano selecionado
    const filteredTransactions = useMemo(() => {
        if (!allTransactions) return [];

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
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={28} />
                    Transações
                </h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    Nova Transação
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {MONTHS.map((month, index) => (
                    <button
                        key={month}
                        className={`btn ${selectedMonth === index ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setSelectedMonth(index)}
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    >
                        {month.slice(0, 3)}
                    </button>
                ))}
            </div>

            {/* Cards de resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <TrendingUp size={18} color="var(--color-success)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Receitas</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        {formatCurrency(totals.income)}
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <TrendingDown size={18} color="var(--color-danger)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Despesas</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                        {formatCurrency(totals.expense)}
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Saldo do Mês</span>
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
                    <h3 className="card-title">
                        {MONTHS[selectedMonth]} {selectedYear} ({filteredTransactions.length} transações)
                    </h3>
                </div>

                {isLoading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhuma transação em {MONTHS[selectedMonth]} de {selectedYear}</p>
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
