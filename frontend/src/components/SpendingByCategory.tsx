import { useTransactions } from '../hooks/useApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

import type { Transaction } from '../types';

interface SpendingByCategoryProps {
    transactions?: Transaction[];
    isLoading?: boolean;
}

export function SpendingByCategory({ transactions: propsTransactions, isLoading: propsLoading }: SpendingByCategoryProps = {}) {
    const { data: hookTransactions, isLoading: hookLoading } = useTransactions();

    const transactions = propsTransactions || hookTransactions;
    const isLoading = propsLoading !== undefined ? propsLoading : hookLoading;

    if (isLoading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Gastos por Categoria</h3>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    // Filtra apenas despesas e agrupa por categoria
    const expenses = transactions?.filter((t) => t.type === 'EXPENSE') || [];

    const categoryTotals = expenses.reduce((acc, t) => {
        const categoryName = t.category?.name || 'Sem Categoria';
        const color = t.category?.color || '#64748b';

        if (!acc[categoryName]) {
            acc[categoryName] = { name: categoryName, value: 0, color };
        }
        acc[categoryName].value += t.amount;
        return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

    const chartData = Object.values(categoryTotals).sort((a, b) => b.value - a.value);
    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

    if (chartData.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Gastos por Categoria</h3>
                </div>
                <div className="empty-state">
                    <p>Nenhuma despesa registrada</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Gastos por Categoria</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Total: {formatCurrency(totalExpenses)}
                </span>
            </div>

            <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '2px solid var(--color-primary)',
                                borderRadius: '8px',
                                color: '#0f172a',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: number) => [formatCurrency(value), 'Valor']}
                        />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconType="circle"
                            formatter={(value, _entry) => {
                                const item = chartData.find((d) => d.name === value);
                                const percentage = item ? ((item.value / totalExpenses) * 100).toFixed(1) : '0';
                                return (
                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 500 }}>
                                        {value} ({percentage}%)
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Lista detalhada */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chartData.map((item) => (
                    <div
                        key={item.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: item.color,
                                }}
                            />
                            <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
                            {formatCurrency(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
