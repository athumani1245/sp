import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getExpenses, addExpense, deleteExpense } from '../services/expenseService';
import { message } from 'antd';

export const expenseKeys = {
  all: ['expenses'] as const,
  list: () => [...expenseKeys.all, 'list'] as const,
};

export const useExpenses = () => {
  return useQuery({
    queryKey: expenseKeys.list(),
    queryFn: getExpenses,
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      message.success('Expense logged successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to log expense';
      message.error(errorMsg);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      message.success('Expense deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete expense';
      message.error(errorMsg);
    },
  });
};
