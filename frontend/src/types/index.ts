export interface Category {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
    monthlyBudget: number | null;
    createdAt: string;
}

export interface CategoryRequest {
    name: string;
    color?: string;
    icon?: string;
    monthlyBudget?: number | null;
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
    endDate: string | null;
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
    endDate?: string | null;
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

// ---- Stocks ----

export type StockEventType = 'BUY' | 'SELL' | 'DIVIDEND' | 'JCP' | 'SPLIT' | 'REVERSE_SPLIT' | 'BONUS' | 'SUBSCRIPTION' | 'AMORTIZATION';

export interface Stock {
    id: number;
    ticker: string;
    name: string | null;
    sector: string | null;
    cnpj: string | null;
    notes: string | null;
    createdAt: string;
}

export interface StockRequest {
    ticker: string;
    name?: string;
    sector?: string;
    cnpj?: string;
    notes?: string;
}

export interface StockEvent {
    id: number;
    stockId: number;
    ticker: string;
    type: StockEventType;
    eventDate: string;
    quantity: number | null;
    unitPrice: number | null;
    fees: number | null;
    splitRatio: number | null;
    totalValue: number | null;
    notes: string | null;
    createdAt: string;
}

export interface StockEventRequest {
    type: StockEventType;
    eventDate: string;
    quantity?: number | null;
    unitPrice?: number | null;
    fees?: number | null;
    splitRatio?: number | null;
    totalValue?: number | null;
    jcpValueIsNet?: boolean;
    notes?: string;
}

export interface StockPosition {
    stockId: number;
    ticker: string;
    name: string | null;
    sector: string | null;
    quantity: number;
    averageCost: number;
    totalInvested: number;
    totalSales: number;
    realizedPL: number;
    totalDividends: number;
    totalJcp: number;
    totalAmortization: number;
}

// ---- Tax Report ----

export interface YearEndPositionDto {
    ticker: string;
    name: string | null;
    cnpj: string | null;
    quantity: number;
    averageCost: number;
    totalCost: number;
    prevQuantity: number;
    prevTotalCost: number;
}

export interface ProventosDto {
    ticker: string;
    name: string | null;
    cnpj: string | null;
    dividends: number;
    jcpGross: number;
    jcpIrrf: number;
    jcpNet: number;
    amortization: number;
}

export interface MonthlyTaxDto {
    month: number;
    monthLabel: string;
    grossSales: number;
    totalCostBasis: number;
    grossResult: number;
    exempt: boolean;
    lossOffset: number;
    taxableResult: number;
    taxDue: number;
    newLossGenerated: number;
    darfDueMonth: string;
}

export interface StockTaxReportResponse {
    year: number;
    yearEndPositions: YearEndPositionDto[];
    proventos: ProventosDto[];
    monthlyResults: MonthlyTaxDto[];
    totalTaxDue: number;
    lossCarriedForward: number;
    totalDividends: number;
    totalJcpGross: number;
    totalJcpIrrf: number;
    totalAmortization: number;
}
