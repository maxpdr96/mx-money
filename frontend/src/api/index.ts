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
};

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
};

export default api;
