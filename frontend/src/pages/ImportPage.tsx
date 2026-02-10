import { useState, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { csvImportApi, categoryApi } from '../api';
import { useLanguage } from '../i18n';
import type { Category } from '../types';
import { Upload, FileSpreadsheet, Loader2, Check, AlertCircle, Pencil, Save, X } from 'lucide-react';

interface CsvImportItem {
    date: string;
    description: string;
    amount: number;
    category: string;
}

export function ImportPage() {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<CsvImportItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: categoryApi.getAll,
    });

    const sortedCategories = useMemo(() =>
        [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        [categories]
    );

    const handleFile = useCallback(async (file: File) => {
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            setError(t.csvImport.invalidFile);
            return;
        }

        setUploading(true);
        setError(null);
        setSaved(false);
        setItems([]);

        try {
            const result = await csvImportApi.upload(file);
            setItems(result);
        } catch (err) {
            setError(t.csvImport.errorProcessing);
            console.error('CSV upload error:', err);
        } finally {
            setUploading(false);
        }
    }, [t]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset para permitir reselecionar o mesmo arquivo
        e.target.value = '';
    }, [handleFile]);

    const updateCategory = (index: number, category: string) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, category } : item
        ));
        setEditingIndex(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            await csvImportApi.save(items);
            setSaved(true);
        } catch (err) {
            setError(t.csvImport.errorSaving);
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setItems([]);
        setSaved(false);
        setError(null);
    };

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="import-page">
            <div className="page-header">
                <h1><FileSpreadsheet size={28} /> {t.csvImport.title}</h1>
                <p className="page-description">{t.csvImport.description}</p>
            </div>

            {/* Upload Area */}
            {items.length === 0 && !uploading && (
                <div
                    className={`csv-upload-area ${dragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <Upload size={48} className="upload-icon" />
                    <h3>{t.csvImport.dragDrop}</h3>
                    <p>{t.csvImport.selectFile}</p>
                </div>
            )}

            {/* Loading */}
            {uploading && (
                <div className="csv-loading">
                    <Loader2 size={48} className="spin" />
                    <h3>{t.csvImport.processing}</h3>
                    <p>{t.csvImport.aiCategorizing}</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="csv-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Success */}
            {saved && (
                <div className="csv-success">
                    <Check size={20} />
                    <span>{t.csvImport.saved}</span>
                    <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                        {t.csvImport.importAnother}
                    </button>
                </div>
            )}

            {/* Results Table */}
            {items.length > 0 && !saved && (
                <div className="csv-results">
                    <div className="csv-results-header">
                        <h2>{t.csvImport.results} ({items.length})</h2>
                        <div className="csv-results-actions">
                            <button className="btn btn-secondary" onClick={handleReset}>
                                <X size={16} /> {t.common.cancel}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <><Loader2 size={16} className="spin" /> {t.csvImport.saving}</>
                                ) : (
                                    <><Save size={16} /> {t.csvImport.saveAll}</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="csv-table-container">
                        <table className="csv-table">
                            <thead>
                                <tr>
                                    <th>{t.csvImport.date}</th>
                                    <th>{t.csvImport.descriptionCol}</th>
                                    <th className="text-right">{t.csvImport.amount}</th>
                                    <th>{t.csvImport.categoryCol}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="csv-date">{item.date}</td>
                                        <td className="csv-description">{item.description}</td>
                                        <td className="csv-amount text-right">
                                            {item.amount.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}
                                        </td>
                                        <td className="csv-category">
                                            {editingIndex === index ? (
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => updateCategory(index, e.target.value)}
                                                    onBlur={() => setEditingIndex(null)}
                                                    autoFocus
                                                    className="category-select"
                                                >
                                                    {sortedCategories.map(c => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))}
                                                    {/* Mostra a categoria atual caso não esteja no banco */}
                                                    {!sortedCategories.some(c => c.name === item.category) && (
                                                        <option value={item.category}>{item.category}</option>
                                                    )}
                                                </select>
                                            ) : (
                                                <span className="category-badge">
                                                    {item.category}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                                title={t.csvImport.editCategory}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}><strong>Total</strong></td>
                                    <td className="csv-amount text-right">
                                        <strong>
                                            {totalAmount.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}
                                        </strong>
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
