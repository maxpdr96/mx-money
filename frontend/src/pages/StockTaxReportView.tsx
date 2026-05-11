import { useState } from 'react';
import { ArrowLeft, Printer, AlertCircle, CheckCircle, TrendingDown, Info } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useStockTaxReport } from '../hooks/useApi';
import type { MonthlyTaxDto, YearEndPositionDto, ProventosDto } from '../types';

function fmtBRL(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtQty(v: number): string {
    return v.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}
function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---- Section wrapper ----
function Section({ color, title, code, hint, children }: {
    color: string; title: string; code?: string; hint?: string; children: React.ReactNode;
}) {
    const borderColors: Record<string, string> = {
        blue: '#3b82f6', green: '#10b981', amber: '#f59e0b', purple: '#8b5cf6', rose: '#f43f5e',
    };
    const bgColors: Record<string, string> = {
        blue: 'rgba(59,130,246,0.05)', green: 'rgba(16,185,129,0.05)',
        amber: 'rgba(245,158,11,0.05)', purple: 'rgba(139,92,246,0.05)', rose: 'rgba(244,63,94,0.05)',
    };

    return (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${borderColors[color]}`, background: bgColors[color] }}>
            <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                <h2 className="card-title" style={{ color: borderColors[color] }}>{title}</h2>
                {code && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>{code}</span>}
                {hint && (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', marginTop: '0.25rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                        <Info size={13} style={{ flexShrink: 0, marginTop: '0.1rem', color: borderColors[color] }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{hint}</p>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}

// ---- Bens e Direitos ----
function Sec1({ positions, tr }: { positions: YearEndPositionDto[]; tr: ReturnType<typeof useLanguage>['t']['taxReport'] }) {
    if (positions.length === 0) {
        return <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.9rem' }}>{tr.sec1Empty}</p>;
    }
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Ticker', 'Empresa', 'CNPJ', tr.sec1Qty, tr.sec1AvgCost, tr.sec1PrevYear, tr.sec1CurrYear].map(h => (
                            <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {positions.map(p => (
                        <tr key={p.ticker} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 700 }}>{p.ticker}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.name ?? '—'}</td>
                            <td style={{ padding: '0.75rem', color: p.cnpj ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: p.cnpj ? 'normal' : 'italic' }}>
                                {p.cnpj ?? '—'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>{fmtQty(p.quantity)}</td>
                            <td style={{ padding: '0.75rem' }}>{fmtBRL(p.averageCost)}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{fmtBRL(p.prevTotalCost)}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>{fmtBRL(p.totalCost)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---- Dividendos ----
function Sec2({ proventos, tr }: { proventos: ProventosDto[]; tr: ReturnType<typeof useLanguage>['t']['taxReport'] }) {
    const filtered = proventos.filter(p => p.dividends > 0);
    if (filtered.length === 0) {
        return <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.9rem' }}>{tr.sec2Empty}</p>;
    }
    const total = filtered.reduce((s, p) => s + p.dividends, 0);
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Ticker', 'Empresa', 'CNPJ (preencher)', 'Total Dividendos'].map(h => (
                            <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.ticker} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 700 }}>{p.ticker}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.name ?? '—'}</td>
                            <td style={{ padding: '0.75rem', color: p.cnpj ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: p.cnpj ? 'normal' : 'italic' }}>
                                {p.cnpj ?? '—'}
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: '#10b981' }}>{fmtBRL(p.dividends)}</td>
                        </tr>
                    ))}
                    <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 700 }}>
                        <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right' }}>Total</td>
                        <td style={{ padding: '0.75rem', color: '#10b981' }}>{fmtBRL(total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ---- JCP ----
function Sec3({ proventos, tr }: { proventos: ProventosDto[]; tr: ReturnType<typeof useLanguage>['t']['taxReport'] }) {
    const filtered = proventos.filter(p => p.jcpGross > 0);
    if (filtered.length === 0) {
        return <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.9rem' }}>{tr.sec3Empty}</p>;
    }
    const totGross = filtered.reduce((s, p) => s + p.jcpGross, 0);
    const totIrrf = filtered.reduce((s, p) => s + p.jcpIrrf, 0);
    const totNet = filtered.reduce((s, p) => s + p.jcpNet, 0);
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Ticker', 'Empresa', 'CNPJ (preencher)', tr.sec3GrossValue, tr.sec3IrrfRetained, tr.sec3NetReceived].map(h => (
                            <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.ticker} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 700 }}>{p.ticker}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.name ?? '—'}</td>
                            <td style={{ padding: '0.75rem', color: p.cnpj ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: p.cnpj ? 'normal' : 'italic' }}>
                                {p.cnpj ?? '—'}
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700 }}>{fmtBRL(p.jcpGross)}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--color-danger)' }}>({fmtBRL(p.jcpIrrf)})</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>{fmtBRL(p.jcpNet)}</td>
                        </tr>
                    ))}
                    <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 700 }}>
                        <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right' }}>Total</td>
                        <td style={{ padding: '0.75rem' }}>{fmtBRL(totGross)}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--color-danger)' }}>({fmtBRL(totIrrf)})</td>
                        <td style={{ padding: '0.75rem', color: '#f59e0b' }}>{fmtBRL(totNet)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ---- Renda Variável ----
function Sec4({ monthly, tr }: { monthly: MonthlyTaxDto[]; tr: ReturnType<typeof useLanguage>['t']['taxReport'] }) {
    if (monthly.length === 0) {
        return <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.9rem' }}>{tr.sec4Empty}</p>;
    }

    const StatusBadge = ({ row }: { row: MonthlyTaxDto }) => {
        if (row.exempt) return <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{tr.exempt}</span>;
        if (row.grossResult < 0) return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{tr.loss}</span>;
        if (row.taxDue > 0) return <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{tr.taxable}</span>;
        return <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{tr.exempt}</span>;
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {[tr.sec4Month, tr.sec4GrossSales, tr.sec4CostBasis, tr.sec4Result, tr.sec4Status, tr.sec4LossOffset, tr.sec4TaxableResult, tr.sec4TaxDue, tr.sec4DarfDue].map(h => (
                            <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {monthly.map(row => (
                        <tr key={row.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{capitalize(row.monthLabel)}</td>
                            <td style={{ padding: '0.75rem' }}>{fmtBRL(row.grossSales)}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{fmtBRL(row.totalCostBasis)}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: row.grossResult >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                {fmtBRL(row.grossResult)}
                            </td>
                            <td style={{ padding: '0.75rem' }}><StatusBadge row={row} /></td>
                            <td style={{ padding: '0.75rem', color: row.lossOffset > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                                {row.lossOffset > 0 ? `(${fmtBRL(row.lossOffset)})` : '—'}
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                                {row.taxableResult > 0 ? fmtBRL(row.taxableResult) : '—'}
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: row.taxDue > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                {row.taxDue > 0 ? fmtBRL(row.taxDue) : '—'}
                            </td>
                            <td style={{ padding: '0.75rem', color: row.taxDue > 0 ? '#92400e' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {row.taxDue > 0 ? capitalize(row.darfDueMonth) : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <AlertCircle size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                {tr.lossCarryNote}
            </div>
        </div>
    );
}

// ---- Amortização ----
function SecAmort({ proventos, tr }: { proventos: ProventosDto[]; tr: ReturnType<typeof useLanguage>['t']['taxReport'] }) {
    const filtered = proventos.filter(p => p.amortization > 0);
    if (filtered.length === 0) return null;
    const total = filtered.reduce((s, p) => s + p.amortization, 0);
    return (
        <Section color="rose" title={tr.amortSection} hint={tr.amortHint}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {['Ticker', 'Empresa', 'Total Amortização'].map(h => (
                                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.ticker} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{p.ticker}</td>
                                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.name ?? '—'}</td>
                                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f43f5e' }}>{fmtBRL(p.amortization)}</td>
                            </tr>
                        ))}
                        <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 700 }}>
                            <td colSpan={2} style={{ padding: '0.75rem', textAlign: 'right' }}>Total</td>
                            <td style={{ padding: '0.75rem', color: '#f43f5e' }}>{fmtBRL(total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Section>
    );
}

// ---- Main component ----

interface Props {
    onBack: () => void;
}

export function StockTaxReportView({ onBack }: Props) {
    const { t } = useLanguage();
    const tr = t.taxReport;
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const { data: report, isLoading } = useStockTaxReport(year);

    return (
        <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <button className="btn btn-ghost" style={{ marginBottom: '0.5rem' }} onClick={onBack}>
                        <ArrowLeft size={16} /> {t.stocks.backToPortfolio}
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{tr.title}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{tr.subtitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tr.year}:</label>
                        <select
                            className="form-select"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            style={{ width: 'auto', padding: '0.5rem 1rem' }}
                        >
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-ghost" onClick={() => window.print()} title={tr.printBtn}>
                        <Printer size={16} /> {tr.printBtn}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>{t.common.loading}</p>
            ) : !report ? null : (
                <>
                    {/* Summary cards */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        {/* IR a pagar */}
                        <div className="card" style={{
                            flex: 1, minWidth: '180px',
                            borderLeft: `4px solid ${report.totalTaxDue > 0 ? 'var(--color-danger)' : 'var(--color-success)'}`,
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{tr.totalTaxDue}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: report.totalTaxDue > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                {fmtBRL(report.totalTaxDue)}
                            </div>
                            {report.totalTaxDue === 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)' }}>
                                    <CheckCircle size={12} /> {tr.noTaxDue}
                                </div>
                            )}
                        </div>

                        {/* Prejuízo a compensar */}
                        {report.lossCarriedForward > 0 && (
                            <div className="card" style={{ flex: 1, minWidth: '180px', borderLeft: '4px solid var(--color-warning)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{tr.lossCarriedForward}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <TrendingDown size={18} color="var(--color-warning)" />
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>{fmtBRL(report.lossCarriedForward)}</span>
                                </div>
                            </div>
                        )}

                        {/* Dividendos */}
                        {report.totalDividends > 0 && (
                            <div className="card" style={{ flex: 1, minWidth: '180px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{tr.totalDividendsIsentos}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{fmtBRL(report.totalDividends)}</div>
                            </div>
                        )}

                        {/* JCP bruto */}
                        {report.totalJcpGross > 0 && (
                            <div className="card" style={{ flex: 1, minWidth: '180px', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{tr.totalJcpGross}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{fmtBRL(report.totalJcpGross)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.2rem' }}>
                                    IRRF retido: {fmtBRL(report.totalJcpIrrf)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 1 */}
                    <Section color="blue" title={tr.sec1Title} code={tr.sec1Code} hint={tr.sec1Hint}>
                        <Sec1 positions={report.yearEndPositions} tr={tr} />
                    </Section>

                    {/* Section 2 */}
                    <Section color="green" title={tr.sec2Title} code={tr.sec2Code} hint={tr.sec2Hint}>
                        <Sec2 proventos={report.proventos} tr={tr} />
                    </Section>

                    {/* Section 3 */}
                    <Section color="amber" title={tr.sec3Title} code={tr.sec3Code} hint={tr.sec3Hint}>
                        <Sec3 proventos={report.proventos} tr={tr} />
                    </Section>

                    {/* Section 4 */}
                    <Section color="purple" title={tr.sec4Title} hint={tr.sec4Hint}>
                        <Sec4 monthly={report.monthlyResults} tr={tr} />
                    </Section>

                    {/* Section 5: Amortização (only if applicable) */}
                    <SecAmort proventos={report.proventos} tr={tr} />
                </>
            )}
        </>
    );
}
