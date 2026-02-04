import { useState, useEffect } from 'react';
import { useCreateTransaction, useUpdateTransaction, useCategories } from '../hooks/useApi';
import { useLanguage } from '../i18n';
import type { TransactionRequest, TransactionType, RecurrenceType, Transaction } from '../types';
import { X } from 'lucide-react';

interface TransactionFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    transaction?: Transaction;
}

export function TransactionForm({ onClose, onSuccess, transaction }: TransactionFormProps) {
    const isEditing = !!transaction;
    const { t } = useLanguage();

    const [type, setType] = useState<TransactionType>(transaction?.type || 'EXPENSE');
    const [description, setDescription] = useState(transaction?.description || '');
    const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
    const [effectiveDate, setEffectiveDate] = useState(
        transaction?.effectiveDate || new Date().toISOString().split('T')[0]
    );
    const [recurrence, setRecurrence] = useState<RecurrenceType>(transaction?.recurrence || 'NONE');
    const [categoryId, setCategoryId] = useState<number | undefined>(transaction?.category?.id);
    const [endDate, setEndDate] = useState<string>(transaction?.endDate || '');

    const { data: categories } = useCategories();
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setDescription(transaction.description);
            setAmount(transaction.amount.toString());
            setEffectiveDate(transaction.effectiveDate);
            setRecurrence(transaction.recurrence);
            setCategoryId(transaction.category?.id);
            setEndDate(transaction.endDate || '');
        }
    }, [transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const request: TransactionRequest = {
            description,
            amount: parseFloat(amount.replace(',', '.')),
            effectiveDate,
            type,
            recurrence,
            categoryId,
            endDate: endDate || null,
        };

        try {
            if (isEditing && transaction) {
                await updateMutation.mutateAsync({ id: transaction.id, request });
            } else {
                await createMutation.mutateAsync(request);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? t.transactions.form.editTitle : t.transactions.form.title}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t.transactions.form.type}</label>
                        <div className="type-toggle">
                            <button
                                type="button"
                                className={`type-toggle-btn income ${type === 'INCOME' ? 'active' : ''}`}
                                onClick={() => setType('INCOME')}
                            >
                                {t.transactions.form.income}
                            </button>
                            <button
                                type="button"
                                className={`type-toggle-btn expense ${type === 'EXPENSE' ? 'active' : ''}`}
                                onClick={() => setType('EXPENSE')}
                            >
                                {t.transactions.form.expense}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="description">
                            {t.transactions.form.description}
                        </label>
                        <input
                            id="description"
                            type="text"
                            className="form-input"
                            placeholder={t.transactions.form.descriptionPlaceholder}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="amount">
                                {t.transactions.form.amount}
                            </label>
                            <input
                                id="amount"
                                type="text"
                                inputMode="decimal"
                                className="form-input"
                                placeholder="0,00"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^[\d,.]*$/.test(value)) {
                                        setAmount(value);
                                    }
                                }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="date">
                                {t.transactions.form.effectiveDate}
                            </label>
                            <input
                                id="date"
                                type="date"
                                className="form-input"
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="category">
                                {t.transactions.form.category}
                            </label>
                            <select
                                id="category"
                                className="form-select"
                                value={categoryId ?? ''}
                                onChange={(e) =>
                                    setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                                }
                            >
                                <option value="">{t.transactions.form.noCategory}</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="recurrence">
                                {t.transactions.form.recurrence}
                            </label>
                            <select
                                id="recurrence"
                                className="form-select"
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                            >
                                <option value="NONE">{t.transactions.form.none}</option>
                                <option value="DAILY">{t.transactions.form.daily}</option>
                                <option value="WEEKLY">{t.transactions.form.weekly}</option>
                                <option value="MONTHLY">{t.transactions.form.monthly}</option>
                                <option value="YEARLY">{t.transactions.form.yearly}</option>
                            </select>
                        </div>
                    </div>

                    {recurrence !== 'NONE' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="endDate">
                                {t.transactions.form.endDate}
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                className="form-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={effectiveDate}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                {t.transactions.form.endDateHint}
                            </span>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            {t.common.cancel}
                        </button>
                        <button
                            type="submit"
                            className={`btn ${type === 'INCOME' ? 'btn-success' : 'btn-danger'}`}
                            disabled={isPending}
                        >
                            {isPending
                                ? t.transactions.form.saving
                                : isEditing
                                    ? t.transactions.form.update
                                    : t.common.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
