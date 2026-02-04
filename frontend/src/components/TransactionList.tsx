import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from './TransactionForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Pencil } from 'lucide-react';
import type { Transaction } from '../types';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, "dd 'de' MMM", { locale: ptBR });
}

const RECURRENCE_LABELS: Record<string, string> = {
    NONE: '',
    DAILY: 'Diária',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
};

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
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

            <div className="transaction-actions">
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={() => onEdit(transaction)}
                    title="Editar"
                >
                    <Pencil size={16} />
                </button>
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={() => onDelete(transaction.id)}
                    title="Excluir"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export function TransactionList() {
    const { data: transactions, isLoading, error } = useTransactions();
    const deleteMutation = useDeleteTransaction();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
    };

    if (isLoading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Últimas Transações</h3>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Últimas Transações</h3>
                </div>
                <p className="empty-state">Erro ao carregar transações</p>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Últimas Transações</h3>
                </div>

                {!transactions || transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p>Nenhuma transação registrada</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Clique no botão "Nova Transação" para começar
                        </p>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {transactions.slice(0, 10).map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                onEdit={handleEdit}
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
        </>
    );
}
