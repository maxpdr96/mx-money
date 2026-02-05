import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { balanceApi, SimulationResponse } from '../api';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calculator, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { useLanguage } from '../i18n';

export function SimulatorPage() {
    const [amount, setAmount] = useState<string>('');
    const [simulatedAmount, setSimulatedAmount] = useState<number | null>(null);
    const [days, setDays] = useState(30);
    const [recurrence, setRecurrence] = useState<string>('NONE');
    const [occurrences, setOccurrences] = useState<number>(1);
    const { t, language } = useLanguage();

    const { data: simulation, isLoading } = useQuery<SimulationResponse>({
        queryKey: ['simulation', simulatedAmount, days, recurrence, occurrences],
        queryFn: () => balanceApi.simulate(simulatedAmount!, days, recurrence, occurrences),
        enabled: simulatedAmount !== null && simulatedAmount > 0,
    });

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

    const handleSimulate = () => {
        const numValue = parseFloat(amount.replace(',', '.'));
        if (!isNaN(numValue) && numValue > 0) {
            setSimulatedAmount(numValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSimulate();
        }
    };

    const chartData = simulation?.projections?.map((p) => ({
        date: p.date,
        dateFormatted: formatDate(p.date, days > 90 ? 'MMM/yy' : 'dd/MM'),
        balance: p.balance,
    })) || [];

    const minBalance = chartData.length > 0 ? Math.min(...chartData.map((d) => d.balance)) : 0;
    const maxBalance = chartData.length > 0 ? Math.max(...chartData.map((d) => d.balance)) : 0;
    const padding = (maxBalance - minBalance) * 0.1 || 100;

    const PROJECTION_OPTIONS = [
        { value: 30, label: `30 ${t.projection.days}` },
        { value: 60, label: `60 ${t.projection.days}` },
        { value: 90, label: `90 ${t.projection.days}` },
        { value: 180, label: `180 ${t.projection.days}` },
        { value: 365, label: language === 'pt-BR' ? '1 ano' : '1 year' },
        { value: 730, label: language === 'pt-BR' ? '2 anos' : '2 years' },
        { value: 3650, label: language === 'pt-BR' ? '10 anos' : '10 years' },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calculator size={28} />
                    {language === 'pt-BR' ? 'Simulador de Impacto' : 'Impact Simulator'}
                </h1>
            </div>

            {/* Description */}
            <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--color-primary-light)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {language === 'pt-BR'
                        ? 'Descubra se você pode fazer uma compra sem ficar no vermelho. Digite o valor e veja o impacto no seu saldo futuro.'
                        : 'Find out if you can make a purchase without going into the red. Enter the amount and see the impact on your future balance.'}
                </p>
            </div>

            {/* Input Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                        <label className="form-label">
                            {language === 'pt-BR' ? 'Valor' : 'Amount'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder={language === 'pt-BR' ? 'Ex: 600' : 'Ex: 600'}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ fontSize: '1.25rem', fontWeight: 600 }}
                        />
                    </div>

                    <div className="form-group" style={{ minWidth: '140px', marginBottom: 0 }}>
                        <label className="form-label">
                            {language === 'pt-BR' ? 'Recorrência' : 'Recurrence'}
                        </label>
                        <select
                            className="form-input"
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                        >
                            <option value="NONE">{language === 'pt-BR' ? 'Única' : 'One-time'}</option>
                            <option value="MONTHLY">{language === 'pt-BR' ? 'Mensal' : 'Monthly'}</option>
                            <option value="WEEKLY">{language === 'pt-BR' ? 'Semanal' : 'Weekly'}</option>
                            <option value="DAILY">{language === 'pt-BR' ? 'Diário' : 'Daily'}</option>
                        </select>
                    </div>

                    {recurrence !== 'NONE' && (
                        <div className="form-group" style={{ minWidth: '100px', marginBottom: 0 }}>
                            <label className="form-label">
                                {language === 'pt-BR' ? 'Vezes' : 'Times'}
                            </label>
                            <input
                                type="number"
                                className="form-input"
                                min={1}
                                max={120}
                                value={occurrences}
                                onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    )}

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

                    <button
                        className="btn btn-primary"
                        onClick={handleSimulate}
                        disabled={!amount || isLoading}
                        style={{ height: '48px', padding: '0 2rem' }}
                    >
                        {isLoading
                            ? (language === 'pt-BR' ? 'Simulando...' : 'Simulating...')
                            : (language === 'pt-BR' ? 'Simular' : 'Simulate')}
                    </button>
                </div>

                {recurrence !== 'NONE' && (
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {language === 'pt-BR'
                            ? `Simulando ${occurrences}x de R$ ${amount} = R$ ${(parseFloat(amount.replace(',', '.')) * occurrences || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total`
                            : `Simulating ${occurrences}x of $${amount} = $${(parseFloat(amount) * occurrences || 0).toFixed(2)} total`}
                    </p>
                )}
            </div>

            {/* Result Card */}
            {simulation && (
                <div className={`card simulator-result ${simulation.goesNegative ? 'danger' : 'safe'}`} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {simulation.goesNegative ? (
                            <AlertTriangle size={32} color="var(--color-danger)" />
                        ) : (
                            <CheckCircle size={32} color="var(--color-success)" />
                        )}
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                                {simulation.goesNegative
                                    ? (language === 'pt-BR' ? 'Cuidado!' : 'Warning!')
                                    : (language === 'pt-BR' ? 'Compra segura!' : 'Safe purchase!')}
                            </h3>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
                                {simulation.goesNegative
                                    ? (language === 'pt-BR'
                                        ? `Seu saldo ficará negativo em ${formatDate(simulation.negativeDate!, "dd 'de' MMMM")} por causa de "${simulation.negativeReason}".`
                                        : `Your balance will go negative on ${formatDate(simulation.negativeDate!, 'MMMM dd')} due to "${simulation.negativeReason}".`)
                                    : (language === 'pt-BR'
                                        ? 'Seu saldo permanece positivo durante todo o período analisado.'
                                        : 'Your balance remains positive throughout the analyzed period.')}
                            </p>
                        </div>
                    </div>

                    {/* Minimum Balance Info */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {language === 'pt-BR' ? 'Saldo mínimo projetado' : 'Projected minimum balance'}
                            </span>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: simulation.minimumBalance < 0 ? 'var(--color-danger)' : 'var(--color-success)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <TrendingDown size={18} />
                                {formatCurrency(simulation.minimumBalance)}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {language === 'pt-BR' ? 'Data do saldo mínimo' : 'Minimum balance date'}
                            </span>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                {formatDate(simulation.minimumBalanceDate, 'dd/MM/yyyy')}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {language === 'pt-BR' ? 'Valor simulado' : 'Simulated amount'}
                            </span>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                                - {formatCurrency(simulation.simulatedAmount)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            {simulation && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {language === 'pt-BR' ? 'Projeção com compra simulada' : 'Projection with simulated purchase'}
                        </h3>
                    </div>

                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="simulatorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={simulation.goesNegative ? '#ef4444' : '#22c55e'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={simulation.goesNegative ? '#ef4444' : '#22c55e'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                <XAxis
                                    dataKey="dateFormatted"
                                    stroke="var(--chart-text)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={Math.floor(days / 10)}
                                />
                                <YAxis
                                    stroke="var(--chart-text)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${language === 'pt-BR' ? 'R$' : '$'}${(value / 1000).toFixed(0)}k`}
                                    domain={[Math.min(minBalance - padding, 0), maxBalance + padding]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                    }}
                                    formatter={(value) => [formatCurrency(Number(value)), language === 'pt-BR' ? 'Saldo' : 'Balance']}
                                    labelFormatter={(label) => `${language === 'pt-BR' ? 'Data' : 'Date'}: ${label}`}
                                />
                                {/* Zero line */}
                                <ReferenceLine y={0} stroke="var(--color-danger)" strokeDasharray="5 5" strokeWidth={2} />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke={simulation.goesNegative ? '#ef4444' : '#22c55e'}
                                    strokeWidth={2}
                                    fill="url(#simulatorGradient)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: simulation.goesNegative ? '#ef4444' : '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!simulation && !isLoading && (
                <div className="card">
                    <div className="empty-state" style={{ padding: '3rem' }}>
                        <Calculator size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>{language === 'pt-BR' ? 'Digite um valor acima para simular o impacto' : 'Enter an amount above to simulate the impact'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
