export interface Category {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
    createdAt: string;
}

export interface CategoryRequest {
    name: string;
    color?: string;
    icon?: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    effectiveDate: string;
    type: TransactionType;
    recurrence: RecurrenceType;
    category: Category | null;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionRequest {
    description: string;
    amount: number;
    effectiveDate: string;
    type: TransactionType;
    recurrence?: RecurrenceType;
    categoryId?: number;
}

export interface BalanceResponse {
    currentBalance: number;
    totalIncome: number;
    totalExpense: number;
    asOfDate: string;
}

export interface BalanceProjection {
    date: string;
    balance: number;
    transactions: Transaction[];
}
