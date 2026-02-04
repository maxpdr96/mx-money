import { useBalance } from '../hooks/useApi';
import { useLanguage } from '../i18n';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export function BalanceCard() {
    const { data: balance, isLoading, error } = useBalance();
    const { t, language } = useLanguage();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD',
        }).format(value);
    };

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
                <p>{t.messages.errorLoading}</p>
            </div>
        );
    }

    return (
        <div className="card balance-card">
            <div className="balance-label">
                <Wallet size={16} style={{ display: 'inline', marginRight: '8px' }} />
                {t.dashboard.currentBalance}
            </div>
            <div className="balance-amount">{formatCurrency(balance.currentBalance)}</div>

            <div className="balance-details">
                <div className="balance-item">
                    <span className="balance-item-label">
                        <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {t.dashboard.income}
                    </span>
                    <span className="balance-item-value income">
                        {formatCurrency(balance.totalIncome)}
                    </span>
                </div>
                <div className="balance-item">
                    <span className="balance-item-label">
                        <TrendingDown size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {t.dashboard.expenses}
                    </span>
                    <span className="balance-item-value expense">
                        {formatCurrency(balance.totalExpense)}
                    </span>
                </div>
            </div>
        </div>
    );
}

