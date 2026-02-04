import { useState, useMemo } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from '../components/TransactionForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Search,
    ArrowUpCircle,
    ArrowDownCircle,
    Pencil,
    Trash2,
    TrendingUp,
    TrendingDown,
    X
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
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

const RECURRENCE_LABELS: Record<string, string> = {
    NONE: '',
    DAILY: 'Diária',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
};

// Normaliza texto para busca (remove acentos e converte para minúsculas)
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (t: Transaction) => void;
    onDelete: (id: number) => void;
    searchTerm: string;
}

function highlightMatch(text: string, searchTerm: string): JSX.Element {
    if (!searchTerm) return <>{text}</>;

    const normalizedText = normalizeText(text);
    const normalizedSearch = normalizeText(searchTerm);
    const index = normalizedText.indexOf(normalizedSearch);

    if (index === -1) return <>{text}</>;

    const before = text.slice(0, index);
    const match = text.slice(index, index + searchTerm.length);
    const after = text.slice(index + searchTerm.length);

    return (
        <>
            {before}
            <mark style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0 2px', borderRadius: '2px' }}>
                {match}
            </mark>
            {after}
        </>
    );
}

function TransactionItem({ transaction, onEdit, onDelete, searchTerm }: TransactionItemProps) {
    const isIncome = transaction.type === 'INCOME';

    return (
        <div className="transaction-item">
            <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
            </div>

            <div className="transaction-info">
                <div className="transaction-description">
                    {highlightMatch(transaction.description, searchTerm)}
                </div>
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

export function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const { data: allTransactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();

    // Filtra transações pela busca
    const filteredTransactions = useMemo(() => {
        if (!allTransactions || !searchTerm.trim()) return [];

        const normalizedSearch = normalizeText(searchTerm.trim());

        return allTransactions.filter((t) =>
            normalizeText(t.description).includes(normalizedSearch)
        ).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    }, [allTransactions, searchTerm]);

    // Calcula totais
    const totals = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { income, expense, count: filteredTransactions.length };
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
                    <Search size={28} />
                    Buscar Transações
                </h1>
            </div>

            {/* Campo de busca */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Digite para buscar... (ex: aluguel, água, salário)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            paddingLeft: '48px',
                            paddingRight: searchTerm ? '48px' : '16px',
                            fontSize: '1.125rem',
                            padding: '16px 16px 16px 48px'
                        }}
                        autoFocus
                    />
                    {searchTerm && (
                        <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                            title="Limpar busca"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Resultados */}
            {searchTerm.trim() && (
                <>
                    {/* Cards de resumo */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <TrendingUp size={18} color="var(--color-success)" />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Receitas</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                                {formatCurrency(totals.income)}
                            </div>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <TrendingDown size={18} color="var(--color-danger)" />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Despesas</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                                {formatCurrency(totals.expense)}
                            </div>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <Search size={18} color="var(--color-primary)" />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Resultados</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {totals.count}
                            </div>
                        </div>
                    </div>

                    {/* Lista de resultados */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Resultados para "{searchTerm}"
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="loading"><div className="spinner"></div></div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="empty-state">
                                <p>Nenhuma transação encontrada</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                    Tente buscar por outro termo
                                </p>
                            </div>
                        ) : (
                            <div className="transaction-list">
                                {filteredTransactions.map((t) => (
                                    <TransactionItem
                                        key={t.id}
                                        transaction={t}
                                        onEdit={setEditingTransaction}
                                        onDelete={handleDelete}
                                        searchTerm={searchTerm}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Estado inicial (sem busca) */}
            {!searchTerm.trim() && (
                <div className="card">
                    <div className="empty-state" style={{ padding: '3rem' }}>
                        <Search size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.125rem' }}>Digite algo para buscar</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                            A busca encontra transações por descrição, ignorando acentos e maiúsculas/minúsculas
                        </p>
                    </div>
                </div>
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
