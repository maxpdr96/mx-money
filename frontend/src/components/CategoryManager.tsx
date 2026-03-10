import { useState, useEffect, useMemo } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useApi';
import type { CategoryRequest, Category } from '../types';
import { X, Plus, Tag, Pencil, Trash2, Wallet } from 'lucide-react';
import { useLanguage } from '../i18n';

interface CategoryFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    category?: Category; // Se fornecido, modo de edição
}

export function CategoryForm({ onClose, onSuccess, category }: CategoryFormProps) {
    const isEditing = !!category;
    const { t } = useLanguage();

    const [name, setName] = useState(category?.name || '');
    const [color, setColor] = useState(category?.color || '#6366f1');
    const [icon, setIcon] = useState(category?.icon || '');
    const [monthlyBudget, setMonthlyBudget] = useState<string>(category?.monthlyBudget?.toString() || '');

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    useEffect(() => {
        if (category) {
            setName(category.name);
            setColor(category.color || '#6366f1');
            setIcon(category.icon || '');
            setMonthlyBudget(category.monthlyBudget?.toString() || '');
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const request: CategoryRequest = {
            name,
            color,
            icon: icon || undefined,
            monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        };

        try {
            if (isEditing && category) {
                await updateMutation.mutateAsync({ id: category.id, request });
            } else {
                await createMutation.mutateAsync(request);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
        }
    };

    const presetColors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEditing ? t.categories.editCategory : t.categories.newCategory}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            {t.categories.name}
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Ex: Alimentação, Transporte, Lazer..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t.categories.color}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {presetColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: c,
                                        border: color === c ? '3px solid white' : '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="icon">
                            Ícone (opcional)
                        </label>
                        <input
                            id="icon"
                            type="text"
                            className="form-input"
                            placeholder="Ex: shopping-cart, car, home..."
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="monthlyBudget">
                            {t.categories.budget}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                                pointerEvents: 'none'
                            }}>
                                <Wallet size={16} />
                            </div>
                            <input
                                id="monthlyBudget"
                                type="number"
                                step="0.01"
                                className="form-input"
                                placeholder="0,00"
                                value={monthlyBudget}
                                onChange={(e) => setMonthlyBudget(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            {t.common.cancel}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isPending}
                        >
                            {isPending ? t.common.loading : t.common.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function CategoryList() {
    const { data: categories, isLoading } = useCategories();
    const deleteMutation = useDeleteCategory();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    const sortedCategories = useMemo(() => {
        if (!categories) return [];
        return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }, [categories]);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
    };

    const handleDelete = async (id: number) => {
        if (confirm(t.categories.confirmDelete)) {
            await deleteMutation.mutateAsync(id);
        }
    };

    if (isLoading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">{t.categories.title}</h3>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Tag size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        {t.categories.title}
                    </h3>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={16} />
                        {t.common.create}
                    </button>
                </div>

                {!sortedCategories || sortedCategories.length === 0 ? (
                    <div className="empty-state">
                        <p>{t.common.noData}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sortedCategories.map((cat) => (
                            <div
                                key={cat.id}
                                className="transaction-item"
                                style={{ padding: '10px 12px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            backgroundColor: cat.color || '#6366f1',
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                            {cat.name}
                                        </span>
                                        {cat.monthlyBudget && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {t.categories.budget}: {formatCurrency(cat.monthlyBudget)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="transaction-actions" style={{ opacity: 1 }}>
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={() => handleEdit(cat)}
                                        title={t.common.edit}
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={() => handleDelete(cat.id)}
                                        title={t.common.delete}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <CategoryForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => setShowForm(false)}
                />
            )}

            {editingCategory && (
                <CategoryForm
                    category={editingCategory}
                    onClose={() => setEditingCategory(null)}
                    onSuccess={() => setEditingCategory(null)}
                />
            )}
        </>
    );
}
