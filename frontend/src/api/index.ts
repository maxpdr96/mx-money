import axios from 'axios';
import type {
    Transaction,
    TransactionRequest,
    Category,
    CategoryRequest,
    BalanceResponse,
    BalanceProjection,
} from '../types';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Transactions
export const transactionApi = {
    getAll: async (startDate?: string, endDate?: string): Promise<Transaction[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const { data } = await api.get<Transaction[]>('/transactions', { params });
        return data;
    },

    getById: async (id: number): Promise<Transaction> => {
        const { data } = await api.get<Transaction>(`/transactions/${id}`);
        return data;
    },

    create: async (request: TransactionRequest): Promise<Transaction> => {
        const { data } = await api.post<Transaction>('/transactions', request);
        return data;
    },

    update: async (id: number, request: TransactionRequest): Promise<Transaction> => {
        const { data } = await api.put<Transaction>(`/transactions/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/transactions/${id}`);
    },
};

// Categories
export const categoryApi = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<Category[]>('/categories');
        return data;
    },

    getById: async (id: number): Promise<Category> => {
        const { data } = await api.get<Category>(`/categories/${id}`);
        return data;
    },

    create: async (request: CategoryRequest): Promise<Category> => {
        const { data } = await api.post<Category>('/categories', request);
        return data;
    },

    update: async (id: number, request: CategoryRequest): Promise<Category> => {
        const { data } = await api.put<Category>(`/categories/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
};

// Balance
export const balanceApi = {
    getCurrent: async (): Promise<BalanceResponse> => {
        const { data } = await api.get<BalanceResponse>('/balance');
        return data;
    },

    getAsOf: async (date: string): Promise<BalanceResponse> => {
        const { data } = await api.get<BalanceResponse>('/balance/as-of', {
            params: { date },
        });
        return data;
    },

    getProjection: async (days: number = 30): Promise<BalanceProjection[]> => {
        const { data } = await api.get<BalanceProjection[]>('/balance/projection', {
            params: { days },
        });
        return data;
    },

    simulate: async (amount: number, days: number = 30, recurrence: string = 'NONE', occurrences: number = 1): Promise<SimulationResponse> => {
        const { data } = await api.get<SimulationResponse>('/balance/simulate', {
            params: { amount, days, recurrence, occurrences },
        });
        return data;
    },
};

// Simulation Response
export interface SimulationResponse {
    simulatedAmount: number;
    projections: BalanceProjection[];
    goesNegative: boolean;
    negativeDate: string | null;
    negativeReason: string | null;
    minimumBalance: number;
    minimumBalanceDate: string;
}

// Backup
export interface BackupInfo {
    name: string;
    size: number;
    created: number;
}

export interface BackupSettings {
    autoBackupEnabled: boolean;
    maxBackups: number;
    backupDirectory: string;
    backupIntervalHours: number;
}

export const backupApi = {
    list: async (): Promise<BackupInfo[]> => {
        const { data } = await api.get<BackupInfo[]>('/backup');
        return data;
    },

    create: async (): Promise<{ name: string; message: string }> => {
        const { data } = await api.post<{ name: string; message: string }>('/backup');
        return data;
    },

    delete: async (backupName: string): Promise<void> => {
        await api.delete(`/backup/${backupName}`);
    },

    restore: async (backupName: string): Promise<{ message: string }> => {
        const { data } = await api.post<{ message: string }>(`/backup/restore/${backupName}`);
        return data;
    },

    exportDatabase: (): string => {
        return '/api/backup/export';
    },

    importDatabase: async (file: File): Promise<{ message: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ message: string }>('/backup/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    getSettings: async (): Promise<BackupSettings> => {
        const { data } = await api.get<BackupSettings>('/backup/settings');
        return data;
    },

    setAutoBackup: async (enabled: boolean): Promise<BackupSettings> => {
        const { data } = await api.put<BackupSettings>('/backup/settings/auto-backup', { enabled });
        return data;
    },

    setDirectory: async (directory: string): Promise<BackupSettings> => {
        const { data } = await api.put<BackupSettings>('/backup/settings/directory', { directory });
        return data;
    },

    setInterval: async (hours: number): Promise<BackupSettings> => {
        const { data } = await api.put<BackupSettings>('/backup/settings/interval', { hours });
        return data;
    },
};

// Reports - AI Analysis
export interface ReportAnalysisResponse {
    analysis: string;
    generatedAt: string;
    success: boolean;
    errorMessage?: string;
}

export const reportsApi = {
    generateAnalysis: async (language: string = 'pt-BR'): Promise<ReportAnalysisResponse> => {
        const { data } = await api.get<ReportAnalysisResponse>('/reports/analysis', {
            params: { language },
        });
        return data;
    },
};

// CSV Import
export interface CsvImportItem {
    date: string;
    description: string;
    amount: number;
    category: string;
}

export const csvImportApi = {
    upload: async (file: File): Promise<CsvImportItem[]> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<CsvImportItem[]>('/csv/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000, // 2 min timeout for AI processing
        });
        return data;
    },

    save: async (items: CsvImportItem[]): Promise<void> => {
        await api.post('/csv/import/save', items);
    },
};

export default api;

