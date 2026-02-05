import { useState, useMemo } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useApi';
import { TransactionForm } from '../components/TransactionForm';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    eachDayOfInterval,
    parseISO
} from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '../i18n';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Plus,
    ArrowUpCircle,
    ArrowDownCircle,
    X,
    Pencil,
    Trash2
} from 'lucide-react';
import type { Transaction } from '../types';

interface DayTransactions {
    date: Date;
    transactions: Transaction[];
    incomeCount: number;
    expenseCount: number;
    totalIncome: number;
    totalExpense: number;
}

export function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const { data: allTransactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();
    const { t, language } = useLanguage();

    const locale = language === 'pt-BR' ? ptBR : enUS;

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    // Generate calendar days with transactions
    const calendarData = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart, { locale });
        const calendarEnd = endOfWeek(monthEnd, { locale });

        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        const transactionsByDate = new Map<string, Transaction[]>();

        if (allTransactions) {
            allTransactions.forEach(tx => {
                const dateKey = tx.effectiveDate;
                if (!transactionsByDate.has(dateKey)) {
                    transactionsByDate.set(dateKey, []);
                }
                transactionsByDate.get(dateKey)!.push(tx);
            });
        }

        return days.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const transactions = transactionsByDate.get(dateKey) || [];
            const incomeTransactions = transactions.filter(tx => tx.type === 'INCOME');
            const expenseTransactions = transactions.filter(tx => tx.type === 'EXPENSE');

            return {
                date,
                transactions,
                incomeCount: incomeTransactions.length,
                expenseCount: expenseTransactions.length,
                totalIncome: incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0),
                totalExpense: expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0),
            } as DayTransactions;
        });
    }, [currentMonth, allTransactions, locale]);

    // Get weekday names
    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(new Date(), { locale });
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            return format(day, 'EEE', { locale });
        });
    }, [locale]);

    // Monthly totals
    const monthlyTotals = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        let income = 0;
        let expense = 0;

        if (allTransactions) {
            allTransactions.forEach(tx => {
                const txDate = parseISO(tx.effectiveDate);
                if (txDate >= monthStart && txDate <= monthEnd) {
                    if (tx.type === 'INCOME') {
                        income += tx.amount;
                    } else {
                        expense += tx.amount;
                    }
                }
            });
        }

        return { income, expense, balance: income - expense };
    }, [currentMonth, allTransactions]);

    // Selected day transactions
    const selectedDayData = useMemo(() => {
        if (!selectedDay) return null;
        return calendarData.find(d => isSameDay(d.date, selectedDay)) || null;
    }, [selectedDay, calendarData]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => {
        setCurrentMonth(new Date());
        setSelectedDay(new Date());
    };

    const handleDelete = async (id: number) => {
        if (confirm(t.transactions.confirmDelete)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleDayClick = (day: DayTransactions) => {
        setSelectedDay(day.date);
    };

    return (
        <div className="calendar-page">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CalendarDays size={28} />
                    {language === 'pt-BR' ? 'Calendário' : 'Calendar'}
                </h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    {t.dashboard.newTransaction}
                </button>
            </div>

            {/* Month Navigation */}
            <div className="calendar-header">
                <button className="btn btn-ghost btn-icon" onClick={handlePrevMonth}>
                    <ChevronLeft size={20} />
                </button>
                <div className="calendar-month-title">
                    <span style={{ textTransform: 'capitalize' }}>
                        {format(currentMonth, 'MMMM yyyy', { locale })}
                    </span>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={handleNextMonth}>
                    <ChevronRight size={20} />
                </button>
                <button className="btn btn-ghost" onClick={handleToday} style={{ marginLeft: '0.5rem' }}>
                    {language === 'pt-BR' ? 'Hoje' : 'Today'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid-summary-3" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {t.dashboard.income}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        {formatCurrency(monthlyTotals.income)}
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {t.dashboard.expenses}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                        {formatCurrency(monthlyTotals.expense)}
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {language === 'pt-BR' ? 'Saldo do Mês' : 'Month Balance'}
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: monthlyTotals.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                        {formatCurrency(monthlyTotals.balance)}
                    </div>
                </div>
            </div>

            {/* Calendar Layout */}
            <div className="calendar-layout">
                {/* Calendar Grid */}
                <div className="card calendar-card">
                    {isLoading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : (
                        <>
                            {/* Weekday Headers */}
                            <div className="calendar-weekdays">
                                {weekDays.map((day, index) => (
                                    <div key={index} className="calendar-weekday">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="calendar-grid">
                                {calendarData.map((dayData, index) => {
                                    const isCurrentMonth = isSameMonth(dayData.date, currentMonth);
                                    const isSelected = selectedDay && isSameDay(dayData.date, selectedDay);
                                    const isTodayDate = isToday(dayData.date);
                                    const hasTransactions = dayData.transactions.length > 0;

                                    return (
                                        <div
                                            key={index}
                                            className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${hasTransactions ? 'has-transactions' : ''}`}
                                            onClick={() => handleDayClick(dayData)}
                                        >
                                            <span className="calendar-day-number">
                                                {format(dayData.date, 'd')}
                                            </span>

                                            {hasTransactions && (
                                                <div className="calendar-indicators">
                                                    {dayData.incomeCount > 0 && (
                                                        <span className="calendar-dot income" title={`${dayData.incomeCount} ${language === 'pt-BR' ? 'receita(s)' : 'income(s)'}`}>
                                                            {dayData.incomeCount > 3 ? `${dayData.incomeCount}` : ''}
                                                        </span>
                                                    )}
                                                    {dayData.expenseCount > 0 && (
                                                        <span className="calendar-dot expense" title={`${dayData.expenseCount} ${language === 'pt-BR' ? 'despesa(s)' : 'expense(s)'}`}>
                                                            {dayData.expenseCount > 3 ? `${dayData.expenseCount}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Day Details Panel */}
                <div className="card calendar-day-panel">
                    {selectedDay ? (
                        <>
                            <div className="card-header" style={{ marginBottom: '1rem' }}>
                                <h3 className="card-title" style={{ textTransform: 'capitalize' }}>
                                    {format(selectedDay, 'EEEE, d MMMM', { locale })}
                                </h3>
                                <button className="btn btn-icon btn-ghost" onClick={() => setSelectedDay(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {selectedDayData && selectedDayData.transactions.length > 0 ? (
                                <>
                                    {/* Day Summary */}
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        {selectedDayData.totalIncome > 0 && (
                                            <span style={{ color: 'var(--color-success)' }}>
                                                + {formatCurrency(selectedDayData.totalIncome)}
                                            </span>
                                        )}
                                        {selectedDayData.totalExpense > 0 && (
                                            <span style={{ color: 'var(--color-danger)' }}>
                                                - {formatCurrency(selectedDayData.totalExpense)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Transaction List */}
                                    <div className="transaction-list">
                                        {selectedDayData.transactions.map(tx => (
                                            <div key={tx.id} className="transaction-item">
                                                <div className={`transaction-icon ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                                                    {tx.type === 'INCOME' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                                </div>
                                                <div className="transaction-info">
                                                    <div className="transaction-description">{tx.description}</div>
                                                    {tx.category && (
                                                        <div className="transaction-meta">
                                                            <span style={{ color: tx.category.color || undefined }}>{tx.category.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`transaction-amount ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                                                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                                                </div>
                                                <div className="transaction-actions" style={{ opacity: 1 }}>
                                                    <button className="btn btn-icon btn-ghost" onClick={() => setEditingTransaction(tx)} title={t.common.edit}>
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(tx.id)} title={t.common.delete}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <p>{language === 'pt-BR' ? 'Sem transações neste dia' : 'No transactions on this day'}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <CalendarDays size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>{language === 'pt-BR' ? 'Selecione um dia para ver as transações' : 'Select a day to view transactions'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Form Modal */}
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
