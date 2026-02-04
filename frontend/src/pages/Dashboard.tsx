import { useState } from 'react';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { CategoryList } from '../components/CategoryManager';
import { SpendingByCategory } from '../components/SpendingByCategory';
import { Plus } from 'lucide-react';

export function Dashboard() {
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Dashboard</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    Nova Transação
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                <BalanceCard />
            </div>

            <div className="dashboard-main">
                <TransactionList />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <CategoryList />
                    <SpendingByCategory />
                </div>
            </div>

            {showForm && (
                <TransactionForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => setShowForm(false)}
                />
            )}
        </>
    );
}
