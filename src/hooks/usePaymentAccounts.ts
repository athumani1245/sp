import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
} from '../services/paymentAccountService';
import { message } from 'antd';

export const paymentAccountKeys = {
  all: ['paymentAccounts'] as const,
  list: () => [...paymentAccountKeys.all, 'list'] as const,
};

export const usePaymentAccounts = () => {
  return useQuery({
    queryKey: paymentAccountKeys.list(),
    queryFn: getPaymentAccounts,
  });
};

export const useCreatePaymentAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentAccountKeys.all });
      message.success('Payment account added successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to add payment account';
      message.error(errorMsg);
    },
  });
};

export const useUpdatePaymentAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentAccountKeys.all });
      message.success('Payment account updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update payment account';
      message.error(errorMsg);
    },
  });
};

export const useDeletePaymentAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePaymentAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentAccountKeys.all });
      message.success('Payment account deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete payment account';
      message.error(errorMsg);
    },
  });
};
