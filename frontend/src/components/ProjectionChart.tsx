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

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

interface ProjectionChartProps {
    days?: number;
}

export function ProjectionChart({ days = 30 }: ProjectionChartProps) {
    const { data: projections, isLoading, error } = useBalanceProjection(days);

    if (isLoading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Projeção de Saldo</h3>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !projections) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Projeção de Saldo</h3>
                </div>
                <p className="empty-state">Erro ao carregar projeção</p>
            </div>
        );
    }

    const chartData = projections.map((p) => ({
        date: p.date,
        dateFormatted: format(new Date(p.date + 'T00:00:00'), 'dd/MM', { locale: ptBR }),
        balance: p.balance,
        hasTransactions: p.transactions && p.transactions.length > 0,
    }));

    const minBalance = Math.min(...chartData.map((d) => d.balance));
    const maxBalance = Math.max(...chartData.map((d) => d.balance));
    const padding = (maxBalance - minBalance) * 0.1 || 100;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Projeção de Saldo - Próximos {days} dias</h3>
            </div>
            <div className="chart-container">
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
                            interval="preserveStartEnd"
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
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                if (payload.hasTransactions) {
                                    return (
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={4}
                                            fill="#6366f1"
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    );
                                }
                                return <circle cx={cx} cy={cy} r={0} />;
                            }}
                            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
