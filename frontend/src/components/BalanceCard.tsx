import { useBalance } from '../hooks/useApi';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function BalanceCard() {
    const { data: balance, isLoading, error } = useBalance();

    if (isLoading) {
        return (
            <div className="card balance-card">
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !balance) {
        return (
            <div className="card balance-card">
                <p>Erro ao carregar saldo</p>
            </div>
        );
    }

    return (
        <div className="card balance-card">
            <div className="balance-label">
                <Wallet size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Saldo Atual
            </div>
            <div className="balance-amount">{formatCurrency(balance.currentBalance)}</div>

            <div className="balance-details">
                <div className="balance-item">
                    <span className="balance-item-label">
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Receitas
                    </span>
                    <span className="balance-item-value income">
                        {formatCurrency(balance.totalIncome)}
                    </span>
                </div>
                <div className="balance-item">
                    <span className="balance-item-label">
                        <TrendingDown size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Despesas
                    </span>
                    <span className="balance-item-value expense">
                        {formatCurrency(balance.totalExpense)}
                    </span>
                </div>
            </div>
        </div>
    );
}
