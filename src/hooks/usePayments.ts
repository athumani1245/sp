import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  cancelPayment,
  generatePaymentReceipt,
} from '../services/paymentService';
import { message } from 'antd';

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: any) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byLease: (leaseId: string) => [...paymentKeys.all, 'lease', leaseId] as const,
};

// Payment Hooks
export const usePayments = (params: any = {}) => {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPayments(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePayment = (paymentId: string | null) => {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId || ''),
    queryFn: () => getPaymentById(paymentId!),
    enabled: !!paymentId,
  });
};

export const useLeasePayments = (leaseId: string | null) => {
  return useQuery({
    queryKey: paymentKeys.byLease(leaseId || ''),
    queryFn: () => getPayments({ lease_id: leaseId! }),
    enabled: !!leaseId,
  });
};

// Payment Mutations
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all payment queries (including specific lease payments)
      queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
        refetchType: 'all',
      });
      // Also invalidate lease queries to update payment counts
      queryClient.invalidateQueries({
        queryKey: ['leases'],
        refetchType: 'active',
      });
      message.success('Payment recorded successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to record payment';
      message.error(errorMsg);
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePayment,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all payment list queries
      queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(),
        refetchType: 'all',
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.paymentId) });
      message.success('Payment updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update payment';
      message.error(errorMsg);
    },
  });
};

export const useCancelPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPayment,
    onSuccess: () => {
      // Invalidate and refetch all payment list queries
      queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(),
        refetchType: 'all',
      });
      message.success('Payment cancelled successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to cancel payment';
      message.error(errorMsg);
    },
  });
};

export const useGenerateReceipt = () => {
  return useMutation({
    mutationFn: generatePaymentReceipt,
    onSuccess: () => {
      message.success('Receipt generated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to generate receipt';
      message.error(errorMsg);
    },
  });
};
