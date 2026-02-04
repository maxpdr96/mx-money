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
import { ptBR } from 'date-fns/locale';
import { Calendar, TrendingUp } from 'lucide-react';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

const PROJECTION_OPTIONS = [
    { value: 30, label: '30 dias' },
    { value: 60, label: '60 dias' },
    { value: 90, label: '90 dias' },
    { value: 180, label: '6 meses' },
    { value: 365, label: '1 ano' },
];

export function ProjectionPage() {
    const [days, setDays] = useState(30);
    const { data: projections, isLoading, error } = useBalanceProjection(days);

    const chartData = projections?.map((p) => ({
        date: p.date,
        dateFormatted: format(new Date(p.date + 'T00:00:00'), days > 90 ? 'MMM/yy' : 'dd/MM', { locale: ptBR }),
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
                    Projeção de Saldo
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
                    <div className="card-title">Saldo Atual</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>
                        {formatCurrency(startBalance)}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Saldo em {days} dias</div>
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
                    <h3 className="card-title">Evolução do Saldo - Próximos {days} dias</h3>
                </div>

                {isLoading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <p className="empty-state">Erro ao carregar projeção</p>
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
                                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                                    domain={[minBalance - padding, maxBalance + padding]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                    formatter={(value) => [formatCurrency(Number(value)), 'Saldo']}
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
