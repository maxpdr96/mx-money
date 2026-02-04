import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from './TransactionForm';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Pencil } from 'lucide-react';
import { useLanguage } from '../i18n';
import type { Transaction } from '../types';

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
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
        const pattern = language === 'pt-BR' ? "dd 'de' MMM" : "MMM dd";
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

            <div className="transaction-actions">
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={() => onEdit(transaction)}
                    title={t.common.edit}
                >
                    <Pencil size={16} />
                </button>
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={() => onDelete(transaction.id)}
                    title={t.common.delete}
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
    const { t } = useLanguage();

    const handleDelete = async (id: number) => {
        if (confirm(t.transactions.confirmDelete)) {
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
                    <h3 className="card-title">{t.dashboard.latestTransactions}</h3>
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
                    <h3 className="card-title">{t.dashboard.latestTransactions}</h3>
                </div>
                <p className="empty-state">{t.messages.errorLoading}</p>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">{t.dashboard.latestTransactions}</h3>
                </div>

                {!transactions || transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p>{t.transactions.noResults}</p>
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

