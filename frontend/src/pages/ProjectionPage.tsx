import { useState } from 'react';
import { useBalanceProjection } from '../hooks/useApi';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n';

export function ProjectionPage() {
    const [days, setDays] = useState(30);
    const { data: projections, isLoading, error } = useBalanceProjection(days);
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

    const formatDate = (dateStr: string, formatStr: string): string => {
        const date = new Date(dateStr + 'T00:00:00');
        const locale = language === 'pt-BR' ? ptBR : enUS;
        return format(date, formatStr, { locale });
    };

    const PROJECTION_OPTIONS = [
        { value: 30, label: `30 ${t.projection.days}` },
        { value: 60, label: `60 ${t.projection.days}` },
        { value: 90, label: `90 ${t.projection.days}` },
        { value: 180, label: `180 ${t.projection.days}` },
        { value: 365, label: language === 'pt-BR' ? '1 ano' : '1 year' },
        { value: 730, label: language === 'pt-BR' ? '2 anos' : '2 years' },
        { value: 3650, label: language === 'pt-BR' ? '10 anos' : '10 years' },
    ];

    const chartData = projections?.map((p) => ({
        date: p.date,
        dateFormatted: formatDate(p.date, days > 90 ? 'MMM/yy' : 'dd/MM'),
        balance: p.balance,
        hasTransactions: p.transactions && p.transactions.length > 0,
    })) || [];

    const minBalance = chartData.length > 0 ? Math.min(...chartData.map((d) => d.balance)) : 0;
    const maxBalance = chartData.length > 0 ? Math.max(...chartData.map((d) => d.balance)) : 0;
    const padding = (maxBalance - minBalance) * 0.1 || 100;

    // Calcula estatísticas
    const startBalance = chartData[0]?.balance || 0;
    const endBalance = chartData[chartData.length - 1]?.balance || 0;
    const balanceChange = endBalance - startBalance;
    const percentChange = startBalance !== 0 ? (balanceChange / startBalance) * 100 : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={28} />
                    {t.projection.title}
                </h1>

                <div className="type-toggle">
                    {PROJECTION_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            className={`type-toggle-btn ${days === opt.value ? 'active income' : ''}`}
                            onClick={() => setDays(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards de resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card">
                    <div className="card-title">{t.projection.currentBalance}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>
                        {formatCurrency(startBalance)}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">{t.projection.projectedBalance}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: endBalance >= startBalance ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {formatCurrency(endBalance)}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Variação</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: balanceChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        <TrendingUp size={20} style={{ transform: balanceChange < 0 ? 'rotate(180deg)' : undefined }} />
                        {balanceChange >= 0 ? '+' : ''}{formatCurrency(balanceChange)}
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Gráfico principal */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">{t.projection.chart} - {days} {t.projection.days}</h3>
                </div>

                {isLoading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <p className="empty-state">{t.messages.errorLoading}</p>
                ) : (
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="dateFormatted"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={days > 90 ? 'preserveStartEnd' : Math.floor(days / 10)}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${language === 'pt-BR' ? 'R$' : '$'}${(value / 1000).toFixed(0)}k`}
                                    domain={[minBalance - padding, maxBalance + padding]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                    formatter={(value) => [formatCurrency(Number(value)), t.projection.currentBalance]}
                                    labelFormatter={(label) => `Data: ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#balanceGradient)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

