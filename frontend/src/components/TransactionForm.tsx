import { useState, useEffect } from 'react';
import { useCreateTransaction, useUpdateTransaction, useCategories } from '../hooks/useApi';
import type { TransactionRequest, TransactionType, RecurrenceType, Transaction } from '../types';
import { X } from 'lucide-react';

interface TransactionFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    transaction?: Transaction; // Se fornecido, modo de edição
}

export function TransactionForm({ onClose, onSuccess, transaction }: TransactionFormProps) {
    const isEditing = !!transaction;

    const [type, setType] = useState<TransactionType>(transaction?.type || 'EXPENSE');
    const [description, setDescription] = useState(transaction?.description || '');
    const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
    const [effectiveDate, setEffectiveDate] = useState(
        transaction?.effectiveDate || new Date().toISOString().split('T')[0]
    );
    const [recurrence, setRecurrence] = useState<RecurrenceType>(transaction?.recurrence || 'NONE');
    const [categoryId, setCategoryId] = useState<number | undefined>(transaction?.category?.id);

    const { data: categories } = useCategories();
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    // Atualiza estado quando transaction muda (para edição)
    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setDescription(transaction.description);
            setAmount(transaction.amount.toString());
            setEffectiveDate(transaction.effectiveDate);
            setRecurrence(transaction.recurrence);
            setCategoryId(transaction.category?.id);
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
            console.error('Erro ao salvar transação:', error);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEditing ? 'Editar Transação' : 'Nova Transação'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tipo</label>
                        <div className="type-toggle">
                            <button
                                type="button"
                                className={`type-toggle-btn income ${type === 'INCOME' ? 'active' : ''}`}
                                onClick={() => setType('INCOME')}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                className={`type-toggle-btn expense ${type === 'EXPENSE' ? 'active' : ''}`}
                                onClick={() => setType('EXPENSE')}
                            >
                                Despesa
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="description">
                            Descrição
                        </label>
                        <input
                            id="description"
                            type="text"
                            className="form-input"
                            placeholder="Ex: Almoço, Salário, Conta de luz..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="amount">
                                Valor (R$)
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
                                    // Permite apenas números, vírgula e ponto
                                    if (/^[\d,.]*$/.test(value)) {
                                        setAmount(value);
                                    }
                                }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="date">
                                Data Efetiva
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
                                Categoria
                            </label>
                            <select
                                id="category"
                                className="form-select"
                                value={categoryId ?? ''}
                                onChange={(e) =>
                                    setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                                }
                            >
                                <option value="">Sem categoria</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="recurrence">
                                Recorrência
                            </label>
                            <select
                                id="recurrence"
                                className="form-select"
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                            >
                                <option value="NONE">Não repete</option>
                                <option value="DAILY">Diária</option>
                                <option value="WEEKLY">Semanal</option>
                                <option value="MONTHLY">Mensal</option>
                                <option value="YEARLY">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`btn ${type === 'INCOME' ? 'btn-success' : 'btn-danger'}`}
                            disabled={isPending}
                        >
                            {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
