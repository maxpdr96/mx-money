import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi, categoryApi, balanceApi } from '../api';
import type { TransactionRequest, CategoryRequest } from '../types';

// Transaction hooks
export function useTransactions(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ['transactions', startDate, endDate],
        queryFn: () => transactionApi.getAll(startDate, endDate),
    });
}

export function useTransaction(id: number) {
    return useQuery({
        queryKey: ['transaction', id],
        queryFn: () => transactionApi.getById(id),
        enabled: id > 0,
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: TransactionRequest) => transactionApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['balance'] });
        },
    });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: TransactionRequest }) =>
            transactionApi.update(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['balance'] });
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => transactionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['balance'] });
        },
    });
}

// Category hooks
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryApi.getAll(),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CategoryRequest) => categoryApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: CategoryRequest }) =>
            categoryApi.update(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => categoryApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}

// Balance hooks
export function useBalance() {
    return useQuery({
        queryKey: ['balance'],
        queryFn: () => balanceApi.getCurrent(),
    });
}

export function useBalanceProjection(days: number = 30) {
    return useQuery({
        queryKey: ['balance', 'projection', days],
        queryFn: () => balanceApi.getProjection(days),
    });
}
