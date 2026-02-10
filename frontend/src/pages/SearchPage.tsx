import { useState, useMemo } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from '../components/TransactionForm';
import { format, parseISO } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '../i18n';
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
        const pattern = language === 'pt-BR' ? "dd 'de' MMMM 'de' yyyy" : "MMMM dd, yyyy";
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

export function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const { t, language } = useLanguage();

    const { data: allTransactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    // Helper para converter texto de mês em número (0-11)
    const getMonthNumber = (monthStr: string): number | null => {
        const normalized = normalizeText(monthStr).substring(0, 3);
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const index = months.indexOf(normalized);
        if (index !== -1) return index;

        // Tenta inglês
        const monthsEn = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        return monthsEn.indexOf(normalized) !== -1 ? monthsEn.indexOf(normalized) : null;
    };

    // Filtra transações pela busca (descrição, categoria, mês)
    const filteredTransactions = useMemo(() => {
        if (!allTransactions || !searchTerm.trim()) return [];

        let term = searchTerm.trim();
        let categoryQuery = '';
        let monthQuery: number | null = null;

        // Extrai #categoria
        const categoryMatch = term.match(/#(?:categoria|category):\s*([^\s#]+)/i);
        if (categoryMatch) {
            categoryQuery = normalizeText(categoryMatch[1]);
            term = term.replace(categoryMatch[0], '').trim();
        }

        // Extrai #mes
        const monthMatch = term.match(/#(?:mes|month):\s*([^\s#]+)/i);
        if (monthMatch) {
            monthQuery = getMonthNumber(monthMatch[1]);
            term = term.replace(monthMatch[0], '').trim();
        }

        // Extrai #ano
        const yearMatch = term.match(/#(?:ano|year):\s*(\d{4})/i);
        let yearQuery: number | null = null;
        if (yearMatch) {
            yearQuery = parseInt(yearMatch[1], 10);
            term = term.replace(yearMatch[0], '').trim();
        }

        const normalizedSearch = normalizeText(term);

        return allTransactions.filter((t) => {
            // Filtro de texto (descrição)
            const matchesText = !normalizedSearch || normalizeText(t.description).includes(normalizedSearch);

            // Filtro de categoria
            const matchesCategory = !categoryQuery || (t.category?.name && normalizeText(t.category.name).includes(categoryQuery));

            const date = parseISO(t.effectiveDate);

            // Filtro de mês
            const matchesMonth = monthQuery === null || date.getMonth() === monthQuery;

            // Filtro de ano
            const matchesYear = yearQuery === null || date.getFullYear() === yearQuery;

            return matchesText && matchesCategory && matchesMonth && matchesYear;
        }).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    }, [allTransactions, searchTerm]);

    // Calcula totais
    const totals = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { income, expense, count: filteredTransactions.length };
    }, [filteredTransactions]);

    const handleDelete = async (id: number) => {
        if (confirm(t.transactions.confirmDelete)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search size={28} />
                    {t.nav.search}
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
                        placeholder={`${t.transactions.searchPlaceholder} (#cat: Alimentação #mes: fev #ano: 2026)`}
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
                            title={t.common.clear}
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
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.transactions.totalIncome}</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                                {formatCurrency(totals.income)}
                            </div>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <TrendingDown size={18} color="var(--color-danger)" />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.transactions.totalExpenses}</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                                {formatCurrency(totals.expense)}
                            </div>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <Search size={18} color="var(--color-primary)" />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.transactions.results}</span>
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
                                {t.transactions.results} "{searchTerm}"
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="loading"><div className="spinner"></div></div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="empty-state">
                                <p>{t.transactions.noResults}</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                    {t.transactions.tryAnother}
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
                        <p style={{ fontSize: '1.125rem' }}>{t.transactions.typeToSearch}</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                            {t.transactions.searchHint}
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

