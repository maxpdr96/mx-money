import { useState, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Plus, ArrowLeft, Pencil, Trash2, X, ChevronRight,
    DollarSign, BarChart2, Gift, FileText, Settings
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { StockTaxReportView } from './StockTaxReportView';
import { useLanguage } from '../i18n';
import {
    useStocks, useStockPortfolio, useStockEvents,
    useCreateStock, useUpdateStock, useDeleteStock,
    useAddStockEvent, useUpdateStockEvent, useDeleteStockEvent,
    useStockSectors, useCreateStockSector, useUpdateStockSector, useDeleteStockSector,
} from '../hooks/useApi';
import type { Stock, StockPosition, StockEvent, StockRequest, StockEventRequest, StockEventType, StockSector, StockSectorRequest } from '../types';

// ---- Formatters ----

function fmtBRL(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtQty(value: number): string {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}

function fmtDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// ---- Sector Manager Modal ----

const SECTOR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

interface SectorManagerProps { onClose: () => void; }

function SectorManager({ onClose }: SectorManagerProps) {
    const { t } = useLanguage();
    const s = t.stocks;
    const { data: sectors = [], isLoading } = useStockSectors();
    const createSector = useCreateStockSector();
    const updateSector = useUpdateStockSector();
    const deleteSector = useDeleteStockSector();

    const [editing, setEditing] = useState<StockSector | null>(null);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState(SECTOR_COLORS[0]);
    const [error, setError] = useState('');

    function openCreate() { setEditing(null); setName(''); setColor(SECTOR_COLORS[0]); setError(''); setCreating(true); }
    function openEdit(sector: StockSector) { setEditing(sector); setName(sector.name); setColor(sector.color ?? SECTOR_COLORS[0]); setError(''); setCreating(true); }
    function closeForm() { setCreating(false); setEditing(null); setError(''); }

    async function handleSave() {
        if (!name.trim()) { setError('Nome obrigatório'); return; }
        const request: StockSectorRequest = { name: name.trim(), color };
        try {
            if (editing) { await updateSector.mutateAsync({ id: editing.id, request }); }
            else { await createSector.mutateAsync(request); }
            closeForm();
        } catch { setError(t.messages.errorSaving); }
    }

    async function handleDelete(sector: StockSector) {
        if (!confirm(s.confirmDeleteSector)) return;
        await deleteSector.mutateAsync(sector.id);
    }

    const isPending = createSector.isPending || updateSector.isPending;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{s.manageSectors}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {creating ? (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>{editing ? s.editSector : s.newSector}</h3>
                            {error && <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
                            <div className="form-group">
                                <label className="form-label">{s.sectorName}</label>
                                <input className="form-input" value={name} onChange={e => setName(e.target.value)} maxLength={100} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{s.sectorColor}</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {SECTOR_COLORS.map(c => (
                                        <button key={c} type="button" onClick={() => setColor(c)}
                                            style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer', transition: 'border 0.15s' }} />
                                    ))}
                                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                                        style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-color)', cursor: 'pointer', padding: 0, background: 'none' }} title="Cor personalizada" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-ghost" onClick={closeForm}>{t.common.cancel}</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
                                    {isPending ? t.common.loading : t.common.save}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={openCreate}>
                            <Plus size={16} /> {s.newSector}
                        </button>
                    )}

                    {isLoading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>{t.common.loading}</p>
                    ) : sectors.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.875rem' }}>{s.noSectors}</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {sectors.map(sector => (
                                <div key={sector.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: sector.color ?? '#6366f1', flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{sector.name}</span>
                                    <button className="btn btn-ghost btn-icon" style={{ padding: '0.25rem' }} onClick={() => openEdit(sector)}><Pencil size={13} /></button>
                                    <button className="btn btn-ghost btn-icon" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} onClick={() => handleDelete(sector)}><Trash2 size={13} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ---- Stock Form Modal ----

interface StockFormProps {
    stock?: Stock | null;
    onClose: () => void;
    onSuccess: () => void;
}

function StockForm({ stock, onClose, onSuccess }: StockFormProps) {
    const { t } = useLanguage();
    const s = t.stocks;
    const createStock = useCreateStock();
    const updateStock = useUpdateStock();
    const { data: sectors = [] } = useStockSectors();

    const [ticker, setTicker] = useState(stock?.ticker ?? '');
    const [name, setName] = useState(stock?.name ?? '');
    const [sector, setSector] = useState(stock?.sector ?? '');
    const [cnpj, setCnpj] = useState(stock?.cnpj ?? '');
    const [notes, setNotes] = useState(stock?.notes ?? '');
    const [error, setError] = useState('');

    const sectorIsCustom = sector !== '' && !sectors.some(s => s.name === sector);
    const [showCustom, setShowCustom] = useState(sectorIsCustom);

    const isEdit = !!stock;
    const isPending = createStock.isPending || updateStock.isPending;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        const request: StockRequest = {
            ticker: ticker.toUpperCase().trim(),
            name: name.trim() || undefined,
            sector: sector.trim() || undefined,
            cnpj: cnpj.trim() || undefined,
            notes: notes.trim() || undefined,
        };
        try {
            if (isEdit) {
                await updateStock.mutateAsync({ id: stock.id, request });
            } else {
                await createStock.mutateAsync(request);
            }
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || t.messages.errorSaving);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{isEdit ? s.editStock : s.newStock}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">{s.ticker} *</label>
                        <input
                            className="form-input"
                            value={ticker}
                            onChange={e => setTicker(e.target.value.toUpperCase())}
                            placeholder={s.tickerPlaceholder}
                            required
                            maxLength={10}
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{s.name}</label>
                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Petróleo Brasileiro S.A." maxLength={200} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{s.sector}</label>
                        {sectors.length > 0 ? (
                            <>
                                <select
                                    className="form-input"
                                    value={showCustom ? '__custom__' : (sector || '')}
                                    onChange={e => {
                                        if (e.target.value === '__custom__') { setShowCustom(true); setSector(''); }
                                        else { setShowCustom(false); setSector(e.target.value); }
                                    }}
                                >
                                    <option value="">{s.sectorSelect}</option>
                                    {sectors.map(sec => (
                                        <option key={sec.id} value={sec.name}>{sec.name}</option>
                                    ))}
                                    <option value="__custom__">{s.sectorCustom}</option>
                                </select>
                                {showCustom && (
                                    <input className="form-input" style={{ marginTop: '0.5rem' }} value={sector} onChange={e => setSector(e.target.value)} placeholder="Ex: Petróleo e Gás, Bancos..." maxLength={100} />
                                )}
                            </>
                        ) : (
                            <input className="form-input" value={sector} onChange={e => setSector(e.target.value)} placeholder="Ex: Petróleo e Gás, Bancos..." maxLength={100} />
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">{s.cnpj}</label>
                        <input className="form-input" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder={s.cnpjPlaceholder} maxLength={20} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{s.notes}</label>
                        <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={500} style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>{t.common.cancel}</button>
                        <button type="submit" className="btn btn-primary" disabled={isPending}>
                            {isPending ? t.common.loading : t.common.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---- Event Form Modal ----

const EVENT_TYPES: StockEventType[] = ['BUY', 'SELL', 'DIVIDEND', 'JCP', 'SPLIT', 'REVERSE_SPLIT', 'BONUS', 'SUBSCRIPTION', 'AMORTIZATION'];

interface EventFormProps {
    stockId: number;
    event?: StockEvent | null;
    onClose: () => void;
    onSuccess: () => void;
}

function EventForm({ stockId, event, onClose, onSuccess }: EventFormProps) {
    const { t } = useLanguage();
    const s = t.stocks;
    const addEvent = useAddStockEvent();
    const updateEvent = useUpdateStockEvent();

    const [type, setType] = useState<StockEventType>(event?.type ?? 'BUY');
    const [eventDate, setEventDate] = useState(event?.eventDate ?? new Date().toISOString().slice(0, 10));
    const [quantity, setQuantity] = useState(event?.quantity?.toString() ?? '');
    const [unitPrice, setUnitPrice] = useState(event?.unitPrice?.toString() ?? '');
    const [fees, setFees] = useState(event?.fees?.toString() ?? '');
    const [splitRatio, setSplitRatio] = useState(event?.splitRatio?.toString() ?? '');
    const [totalValue, setTotalValue] = useState(event?.totalValue?.toString() ?? '');
    const [jcpValueIsNet, setJcpValueIsNet] = useState(false);
    const [notes, setNotes] = useState(event?.notes ?? '');
    const [error, setError] = useState('');

    const isEdit = !!event;
    const isPending = addEvent.isPending || updateEvent.isPending;

    const needsQuantityPrice = type === 'BUY' || type === 'SELL' || type === 'SUBSCRIPTION';
    const needsFees = type === 'BUY' || type === 'SELL' || type === 'SUBSCRIPTION';
    const needsSplit = type === 'SPLIT';
    const needsReverseSplit = type === 'REVERSE_SPLIT';
    const needsTotalValue = type === 'DIVIDEND' || type === 'JCP' || type === 'AMORTIZATION';
    const needsAmortPerShare = type === 'AMORTIZATION';
    const needsBonus = type === 'BONUS';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const request: StockEventRequest = {
            type,
            eventDate,
            quantity: (needsQuantityPrice || needsBonus) && quantity ? parseFloat(quantity) : null,
            unitPrice: (needsQuantityPrice || needsBonus || needsAmortPerShare) && unitPrice ? parseFloat(unitPrice) : null,
            fees: needsFees && fees ? parseFloat(fees) : null,
            splitRatio: (needsSplit || needsReverseSplit) && splitRatio ? parseFloat(splitRatio) : null,
            totalValue: needsTotalValue && totalValue ? parseFloat(totalValue) : null,
            jcpValueIsNet: type === 'JCP' ? jcpValueIsNet : undefined,
            notes: notes.trim() || undefined,
        };

        try {
            if (isEdit) {
                await updateEvent.mutateAsync({ stockId, eventId: event.id, request });
            } else {
                await addEvent.mutateAsync({ stockId, request });
            }
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || t.messages.errorSaving);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEdit ? s.editEvent : s.addEvent}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Event type selector */}
                    <div className="form-group">
                        <label className="form-label">{s.eventType} *</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {EVENT_TYPES.map(et => (
                                <button
                                    key={et}
                                    type="button"
                                    onClick={() => setType(et)}
                                    style={{
                                        padding: '0.4rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        borderColor: type === et ? 'var(--color-primary)' : 'var(--border-color)',
                                        background: type === et ? 'var(--color-primary)' : 'var(--bg-primary)',
                                        color: type === et ? 'white' : 'var(--text-secondary)',
                                    }}
                                >
                                    {s.eventTypes[et]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{s.eventDate} *</label>
                        <input type="date" className="form-input" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                    </div>

                    {needsQuantityPrice && (
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">{s.quantity} *</label>
                                <input type="number" className="form-input" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="0" step="any" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{s.unitPrice} *</label>
                                <input type="number" className="form-input" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0,00" min="0" step="any" required />
                            </div>
                        </div>
                    )}

                    {needsFees && (
                        <div className="form-group">
                            <label className="form-label">{s.fees}</label>
                            <input type="number" className="form-input" value={fees} onChange={e => setFees(e.target.value)} placeholder="0,00" min="0" step="any" />
                        </div>
                    )}

                    {needsTotalValue && (
                        <div className="form-group">
                            <label className="form-label">{s.totalValue} *</label>
                            <input type="number" className="form-input" value={totalValue} onChange={e => setTotalValue(e.target.value)} placeholder="0,00" min="0" step="any" required />
                            {type === 'JCP' && (
                                <>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, alignSelf: 'center' }}>{s.jcpValueType}:</span>
                                        {[false, true].map(isNet => (
                                            <button
                                                key={String(isNet)}
                                                type="button"
                                                onClick={() => setJcpValueIsNet(isNet)}
                                                style={{
                                                    padding: '0.3rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    borderColor: jcpValueIsNet === isNet ? 'var(--color-primary)' : 'var(--border-color)',
                                                    background: jcpValueIsNet === isNet ? 'var(--color-primary)' : 'var(--bg-primary)',
                                                    color: jcpValueIsNet === isNet ? 'white' : 'var(--text-secondary)',
                                                }}
                                            >
                                                {isNet ? s.jcpNetLabel : s.jcpGrossLabel}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {jcpValueIsNet ? s.jcpNetHint : s.jcpGrossHint}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {needsSplit && (
                        <div className="form-group">
                            <label className="form-label">{s.splitRatio} *</label>
                            <input type="number" className="form-input" value={splitRatio} onChange={e => setSplitRatio(e.target.value)} placeholder="2" min="0" step="any" required />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.splitRatioHint}</p>
                        </div>
                    )}

                    {needsReverseSplit && (
                        <div className="form-group">
                            <label className="form-label">{s.reverseSplitRatio} *</label>
                            <input type="number" className="form-input" value={splitRatio} onChange={e => setSplitRatio(e.target.value)} placeholder="10" min="0" step="any" required />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.reverseSplitRatioHint}</p>
                        </div>
                    )}

                    {needsAmortPerShare && (
                        <div className="form-group">
                            <label className="form-label">{s.amortPerShare} *</label>
                            <input type="number" className="form-input" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0,00" min="0" step="any" required />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.amortNote}</p>
                        </div>
                    )}

                    {needsBonus && (
                        <>
                            <div className="form-group">
                                <label className="form-label">{s.bonusShares} *</label>
                                <input type="number" className="form-input" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="0" step="any" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{s.declaredValue} *</label>
                                <input type="number" className="form-input" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0,00" min="0" step="any" required />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">{s.notes}</label>
                        <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>{t.common.cancel}</button>
                        <button type="submit" className="btn btn-primary" disabled={isPending}>
                            {isPending ? t.common.loading : t.common.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---- Event type badge ----

function EventTypeBadge({ type, label }: { type: StockEventType; label: string }) {
    const colors: Record<StockEventType, { bg: string; color: string }> = {
        BUY:          { bg: '#dbeafe', color: '#1d4ed8' },
        SELL:         { bg: '#fee2e2', color: '#b91c1c' },
        DIVIDEND:     { bg: '#d1fae5', color: '#065f46' },
        JCP:          { bg: '#ecfdf5', color: '#047857' },
        SPLIT:        { bg: '#fef3c7', color: '#92400e' },
        REVERSE_SPLIT:{ bg: '#ffedd5', color: '#c2410c' },
        BONUS:        { bg: '#ede9fe', color: '#5b21b6' },
        SUBSCRIPTION: { bg: '#e0e7ff', color: '#3730a3' },
        AMORTIZATION: { bg: '#fce7f3', color: '#9d174d' },
    };
    const c = colors[type];
    return (
        <span style={{ background: c.bg, color: c.color, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {label}
        </span>
    );
}

// ---- Stock Detail View ----

interface StockDetailProps {
    stock: Stock;
    onBack: () => void;
}

function StockDetail({ stock, onBack }: StockDetailProps) {
    const { t } = useLanguage();
    const s = t.stocks;
    const { data: events = [], isLoading } = useStockEvents(stock.id);
    const deleteEvent = useDeleteStockEvent();

    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<StockEvent | null>(null);
    const [activeTab, setActiveTab] = useState<'events' | 'proventos'>('events');
    const [filterType, setFilterType] = useState<StockEventType | null>(null);

    // Calculate position from events
    let qty = 0;
    let avgCost = 0;
    let totalInvested = 0;
    let totalSales = 0;
    let realizedPL = 0;
    let totalDividends = 0;
    let totalJcp = 0;

    const sorted = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.id - b.id);
    for (const e of sorted) {
        const q = e.quantity ?? 0;
        const p = e.unitPrice ?? 0;
        const f = e.fees ?? 0;
        if (e.type === 'BUY' || e.type === 'SUBSCRIPTION') {
            const cost = q * p + f;
            if (qty + q > 0) avgCost = (qty * avgCost + cost) / (qty + q);
            qty += q;
            totalInvested += cost;
        } else if (e.type === 'SELL') {
            const net = q * p - f;
            realizedPL += net - q * avgCost;
            totalSales += net;
            qty -= q;
            if (qty <= 0) { qty = 0; avgCost = 0; }
        } else if (e.type === 'DIVIDEND') {
            totalDividends += e.totalValue ?? 0;
        } else if (e.type === 'JCP') {
            totalJcp += e.totalValue ?? 0;
        } else if (e.type === 'SPLIT') {
            const ratio = e.splitRatio ?? 1;
            if (ratio > 0 && qty > 0) { qty = qty * ratio; avgCost = avgCost / ratio; }
        } else if (e.type === 'REVERSE_SPLIT') {
            const ratio = e.splitRatio ?? 1;
            if (ratio > 0 && qty > 0) { qty = qty / ratio; avgCost = avgCost * ratio; }
        } else if (e.type === 'BONUS') {
            const bonus = q;
            const declared = p;
            if (bonus > 0) {
                const newQty = qty + bonus;
                if (newQty > 0) avgCost = (qty * avgCost + bonus * declared) / newQty;
                qty = newQty;
                totalInvested += bonus * declared;
            }
        } else if (e.type === 'AMORTIZATION') {
            if (p > 0) avgCost = Math.max(0, avgCost - p);
        }
    }

    // Tipos que existem nos eventos desta ação (para os chips de filtro)
    const presentTypes = useMemo(
        () => [...new Set(sorted.map(e => e.type))] as StockEventType[],
        [sorted]
    );

    // Eventos filtrados pelo tipo selecionado
    const filteredEvents = filterType ? sorted.filter(e => e.type === filterType) : sorted;

    // Proventos agrupados por ano-mês (Feature 3)
    const proventosByMonth = useMemo(() => {
        const map = new Map<string, { dividends: number; jcpGross: number; amort: number }>();
        for (const e of sorted) {
            if (e.type !== 'DIVIDEND' && e.type !== 'JCP' && e.type !== 'AMORTIZATION') continue;
            const [year, month] = e.eventDate.split('-');
            const key = `${year}-${month}`;
            const row = map.get(key) ?? { dividends: 0, jcpGross: 0, amort: 0 };
            if (e.type === 'DIVIDEND') row.dividends += e.totalValue ?? 0;
            if (e.type === 'JCP') row.jcpGross += e.totalValue ?? 0;
            if (e.type === 'AMORTIZATION') row.amort += e.totalValue ?? 0;
            map.set(key, row);
        }
        return Array.from(map.entries())
            .sort(([a], [b]) => b.localeCompare(a)) // mais recente primeiro
            .map(([key, row]) => {
                const [year, month] = key.split('-');
                const irrf = row.jcpGross * 0.175;
                const label = new Date(Number(year), Number(month) - 1, 1)
                    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                return { key, label, ...row, irrf, jcpNet: row.jcpGross - irrf, total: row.dividends + row.jcpGross - irrf + row.amort };
            });
    }, [sorted]);

    async function handleDeleteEvent(event: StockEvent) {
        if (!confirm(s.confirmDeleteEvent)) return;
        await deleteEvent.mutateAsync({ stockId: stock.id, eventId: event.id });
    }

    const statCard = (label: string, value: string, color?: string) => (
        <div className="card" style={{ flex: 1, minWidth: '140px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: color ?? 'var(--text-primary)' }}>{value}</div>
        </div>
    );

    const tabBtn = (tab: 'events' | 'proventos', label: string) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.15s',
            }}
        >
            {label}
        </button>
    );

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn btn-ghost" onClick={onBack} style={{ gap: '0.4rem' }}>
                    <ArrowLeft size={16} /> {s.back}
                </button>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{stock.ticker}</h1>
                    {stock.name && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{stock.name}{stock.sector ? ` · ${stock.sector}` : ''}</p>}
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                {statCard(s.quantity, `${fmtQty(qty)} ${s.shares}`)}
                {statCard(s.avgCost, fmtBRL(avgCost))}
                {statCard(s.totalInvested, fmtBRL(totalInvested))}
                {statCard(s.realizedPL, fmtBRL(realizedPL), realizedPL >= 0 ? 'var(--color-success)' : 'var(--color-danger)')}
                {statCard(s.totalDividends, fmtBRL(totalDividends))}
                {statCard(s.totalJcp, fmtBRL(totalJcp))}
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.25rem', width: 'fit-content' }}>
                {tabBtn('events', s.eventsTab)}
                {tabBtn('proventos', s.proventosTab)}
            </div>

            {/* ---- Tab: Histórico de Eventos ---- */}
            {activeTab === 'events' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><BarChart2 size={18} /> {s.eventsTab}</h2>
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={() => { setEditingEvent(null); setShowEventForm(true); }}>
                            <Plus size={16} /> {s.addEvent}
                        </button>
                    </div>

                    {/* Filtro por tipo */}
                    {events.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0 0 1rem 0' }}>
                            <button
                                onClick={() => setFilterType(null)}
                                style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid',
                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                    borderColor: filterType === null ? 'var(--color-primary)' : 'var(--border-color)',
                                    background: filterType === null ? 'var(--color-primary)' : 'var(--bg-primary)',
                                    color: filterType === null ? 'white' : 'var(--text-secondary)',
                                }}
                            >
                                {s.filterAll} ({sorted.length})
                            </button>
                            {presentTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(filterType === type ? null : type)}
                                    style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid',
                                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                        borderColor: filterType === type ? 'var(--color-primary)' : 'var(--border-color)',
                                        background: filterType === type ? 'var(--color-primary)' : 'var(--bg-primary)',
                                        color: filterType === type ? 'white' : 'var(--text-secondary)',
                                    }}
                                >
                                    {s.eventTypes[type]} ({sorted.filter(e => e.type === type).length})
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>{t.common.loading}</p>
                    ) : events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{s.noEvents}</p>
                            <p style={{ fontSize: '0.875rem' }}>{s.noEventsHint}</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        {['Data', 'Tipo', 'Qtd', 'Preço Unit.', 'Taxas', 'Split', 'Valor Total', 'Obs.', ''].map(h => (
                                            <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.map(ev => (
                                        <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>{fmtDate(ev.eventDate)}</td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>
                                                <EventTypeBadge type={ev.type} label={s.eventTypes[ev.type]} />
                                            </td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>{ev.quantity != null ? fmtQty(ev.quantity) : '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>{ev.unitPrice != null ? fmtBRL(ev.unitPrice) : '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>{ev.fees != null ? fmtBRL(ev.fees) : '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>{ev.splitRatio != null ? `${ev.splitRatio}x` : '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>{ev.totalValue != null ? fmtBRL(ev.totalValue) : '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.notes ?? ''}</td>
                                            <td style={{ padding: '0.6rem 0.75rem' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button className="btn btn-ghost btn-icon" style={{ padding: '0.3rem' }} onClick={() => { setEditingEvent(ev); setShowEventForm(true); }} title={t.common.edit}>
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon" style={{ padding: '0.3rem', color: 'var(--color-danger)' }} onClick={() => handleDeleteEvent(ev)} title={t.common.delete}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filterType && filteredEvents.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>{t.common.noData}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ---- Tab: Proventos por Mês ---- */}
            {activeTab === 'proventos' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><Gift size={18} /> {s.proventosTab}</h2>
                    </div>
                    {proventosByMonth.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <p style={{ fontWeight: 600 }}>{s.noProventos}</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        {[s.proventosMonth, s.proventosDividends, s.proventosJcpGross, s.proventosJcpIrrf, s.proventosJcpNet, s.proventosAmort, s.proventosTotal].map(h => (
                                            <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {proventosByMonth.map(row => (
                                        <tr key={row.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{row.label}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: row.dividends > 0 ? '#10b981' : 'var(--text-muted)' }}>
                                                {row.dividends > 0 ? fmtBRL(row.dividends) : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: row.jcpGross > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                                                {row.jcpGross > 0 ? fmtBRL(row.jcpGross) : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: row.irrf > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                                {row.irrf > 0 ? `(${fmtBRL(row.irrf)})` : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: row.jcpNet > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                                                {row.jcpNet > 0 ? fmtBRL(row.jcpNet) : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: row.amort > 0 ? '#f43f5e' : 'var(--text-muted)' }}>
                                                {row.amort > 0 ? fmtBRL(row.amort) : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{fmtBRL(row.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 700, borderTop: '2px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>Total</td>
                                        <td style={{ padding: '0.75rem', color: '#10b981' }}>{fmtBRL(proventosByMonth.reduce((a, r) => a + r.dividends, 0))}</td>
                                        <td style={{ padding: '0.75rem', color: '#f59e0b' }}>{fmtBRL(proventosByMonth.reduce((a, r) => a + r.jcpGross, 0))}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--color-danger)' }}>({fmtBRL(proventosByMonth.reduce((a, r) => a + r.irrf, 0))})</td>
                                        <td style={{ padding: '0.75rem', color: '#f59e0b' }}>{fmtBRL(proventosByMonth.reduce((a, r) => a + r.jcpNet, 0))}</td>
                                        <td style={{ padding: '0.75rem', color: '#f43f5e' }}>{fmtBRL(proventosByMonth.reduce((a, r) => a + r.amort, 0))}</td>
                                        <td style={{ padding: '0.75rem' }}>{fmtBRL(proventosByMonth.reduce((a, r) => a + r.total, 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showEventForm && (
                <EventForm
                    stockId={stock.id}
                    event={editingEvent}
                    onClose={() => { setShowEventForm(false); setEditingEvent(null); }}
                    onSuccess={() => { setShowEventForm(false); setEditingEvent(null); }}
                />
            )}
        </>
    );
}

// ---- Portfolio card for a single stock ----

interface StockCardProps {
    position: StockPosition;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function StockCard({ position, onSelect, onEdit, onDelete }: StockCardProps) {
    const { t } = useLanguage();
    const s = t.stocks;
    const pl = position.realizedPL;
    const proventos = position.totalDividends + position.totalJcp;

    return (
        <div className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{position.ticker}</span>
                        {pl !== 0 && (pl >= 0
                            ? <TrendingUp size={16} color="var(--color-success)" />
                            : <TrendingDown size={16} color="var(--color-danger)" />)}
                    </div>
                    {position.name && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{position.name}</p>}
                    {position.sector && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{position.sector}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost btn-icon" style={{ padding: '0.3rem' }} onClick={onEdit} title={t.common.edit}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-icon" style={{ padding: '0.3rem', color: 'var(--color-danger)' }} onClick={onDelete} title={t.common.delete}><Trash2 size={14} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.quantity}</div>
                    <div style={{ fontWeight: 600 }}>{fmtQty(position.quantity)} {s.shares}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.avgCost}</div>
                    <div style={{ fontWeight: 600 }}>{fmtBRL(position.averageCost)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.totalInvested}</div>
                    <div style={{ fontWeight: 600 }}>{fmtBRL(position.totalInvested)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.realizedPL}</div>
                    <div style={{ fontWeight: 700, color: pl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{fmtBRL(pl)}</div>
                </div>
            </div>

            {proventos > 0 && (
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-primary-light)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        <Gift size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                        {s.totalDividends}: {fmtBRL(position.totalDividends)} · {s.totalJcp}: {fmtBRL(position.totalJcp)}
                    </span>
                </div>
            )}

            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'space-between' }} onClick={onSelect}>
                {s.events} <ChevronRight size={16} />
            </button>
        </div>
    );
}

// ---- Main Page ----

type StocksView = 'portfolio' | 'detail' | 'tax-report';

export function StocksPage() {
    const { t } = useLanguage();
    const s = t.stocks;

    const { data: stocks = [], isLoading: loadingStocks } = useStocks();
    const { data: positions = [], isLoading: loadingPortfolio } = useStockPortfolio();
    const { data: sectors = [] } = useStockSectors();
    const deleteStock = useDeleteStock();

    const [view, setView] = useState<StocksView>('portfolio');
    const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
    const [showStockForm, setShowStockForm] = useState(false);
    const [editingStock, setEditingStock] = useState<Stock | null>(null);
    const [showSectorManager, setShowSectorManager] = useState(false);

    const selectedStock = stocks.find(s => s.id === selectedStockId) ?? null;

    const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0);
    const totalRealizedPL = positions.reduce((sum, p) => sum + p.realizedPL, 0);
    const totalProventos = positions.reduce((sum, p) => sum + p.totalDividends + p.totalJcp, 0);

    // Chart data: allocation by sector
    const sectorAlloc = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of positions) {
            const key = p.sector || 'Outros';
            map.set(key, (map.get(key) ?? 0) + p.totalInvested);
        }
        return Array.from(map.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({ name, value }));
    }, [positions]);

    // Chart data: quantity by ticker
    const qtyByTicker = useMemo(() =>
        positions
            .filter(p => p.quantity > 0)
            .sort((a, b) => b.quantity - a.quantity)
            .map(p => ({ name: p.ticker, qty: p.quantity })),
        [positions]
    );

    // Palette for sector pie slices — match registered sector colors
    const sectorColorMap = useMemo(() => {
        const m = new Map<string, string>();
        sectors.forEach(sec => { if (sec.color) m.set(sec.name, sec.color); });
        return m;
    }, [sectors]);
    const PIE_FALLBACK_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

    async function handleDeleteStock(stock: Stock) {
        if (!confirm(s.confirmDeleteStock)) return;
        await deleteStock.mutateAsync(stock.id);
    }

    function openDetail(stockId: number) {
        setSelectedStockId(stockId);
        setView('detail');
    }

    const isLoading = loadingStocks || loadingPortfolio;

    if (view === 'tax-report') {
        return <StockTaxReportView onBack={() => setView('portfolio')} />;
    }

    if (view === 'detail' && selectedStock) {
        return (
            <StockDetail
                stock={selectedStock}
                onBack={() => { setView('portfolio'); setSelectedStockId(null); }}
            />
        );
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{s.title}</h1>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost" onClick={() => setShowSectorManager(true)}>
                        <Settings size={16} /> {s.manageSectors}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setView('tax-report')}>
                        <FileText size={16} /> {s.taxReport}
                    </button>
                    <button className="btn btn-primary" onClick={() => { setEditingStock(null); setShowStockForm(true); }}>
                        <Plus size={18} /> {s.newStock}
                    </button>
                </div>
            </div>

            {/* Portfolio summary */}
            {positions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="card" style={{ flex: 1, minWidth: '160px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', border: 'none' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <DollarSign size={13} /> {s.totalInvestedAll}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{fmtBRL(totalInvested)}</div>
                    </div>
                    <div className="card" style={{ flex: 1, minWidth: '160px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {totalRealizedPL >= 0 ? <TrendingUp size={13} color="var(--color-success)" /> : <TrendingDown size={13} color="var(--color-danger)" />}
                            {s.totalReturnAll}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: totalRealizedPL >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{fmtBRL(totalRealizedPL)}</div>
                    </div>
                    <div className="card" style={{ flex: 1, minWidth: '160px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Gift size={13} /> {s.totalProventosAll}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-success)' }}>{fmtBRL(totalProventos)}</div>
                    </div>
                </div>
            )}

            {/* Charts */}
            {positions.length > 1 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>{s.chartsTitle}</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        {/* Pie: allocation by sector */}
                        {sectorAlloc.length > 0 && (
                            <div style={{ flex: 1, minWidth: '260px' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>{s.chartSectorAlloc}</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={sectorAlloc} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {sectorAlloc.map((entry, idx) => (
                                                <Cell key={entry.name} fill={sectorColorMap.get(entry.name) ?? PIE_FALLBACK_COLORS[idx % PIE_FALLBACK_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: number) => fmtBRL(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {/* Bar: qty by ticker */}
                        {qtyByTicker.length > 0 && (
                            <div style={{ flex: 2, minWidth: '300px' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>{s.chartQtyByTicker}</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={qtyByTicker} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(v: number) => fmtQty(v)} />
                                        <Bar dataKey="qty" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                                            {qtyByTicker.map((entry, idx) => (
                                                <Cell key={entry.name} fill={PIE_FALLBACK_COLORS[idx % PIE_FALLBACK_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Stock grid */}
            {isLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>{t.common.loading}</p>
            ) : stocks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <BarChart2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.noStocks}</p>
                    <p style={{ fontSize: '0.875rem' }}>{s.noStocksHint}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {stocks.map(stock => {
                        const pos = positions.find(p => p.stockId === stock.id);
                        if (!pos) return null;
                        return (
                            <StockCard
                                key={stock.id}
                                position={pos}
                                onSelect={() => openDetail(stock.id)}
                                onEdit={() => { setEditingStock(stock); setShowStockForm(true); }}
                                onDelete={() => handleDeleteStock(stock)}
                            />
                        );
                    })}
                </div>
            )}

            {showStockForm && (
                <StockForm
                    stock={editingStock}
                    onClose={() => { setShowStockForm(false); setEditingStock(null); }}
                    onSuccess={() => { setShowStockForm(false); setEditingStock(null); }}
                />
            )}

            {showSectorManager && (
                <SectorManager onClose={() => setShowSectorManager(false)} />
            )}
        </>
    );
}
