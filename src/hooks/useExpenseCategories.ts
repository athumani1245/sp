import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getExpenseCategories,
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from '../services/expenseCategoryService';
import { message } from 'antd';

export const expenseCategoryKeys = {
  all: ['expenseCategories'] as const,
  list: () => [...expenseCategoryKeys.all, 'list'] as const,
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: expenseCategoryKeys.list(),
    queryFn: getExpenseCategories,
  });
};

export const useAddExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
      message.success('Category added successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to add category';
      message.error(errorMsg);
    },
  });
};

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update category';
      message.error(errorMsg);
    },
  });
};

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
      message.success('Category deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete category';
      message.error(errorMsg);
    },
  });
};
