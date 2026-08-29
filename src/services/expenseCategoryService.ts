import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

export interface ExpenseCategory {
  id: string;
  name: string;
}

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await api.get(`${API_BASE}/expense-categories/`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : (data.items || data.results || []);
};

export const addExpenseCategory = async (name: string): Promise<ExpenseCategory> => {
  const response = await api.post(`${API_BASE}/expense-categories/`, { name });
  return response.data.data || response.data;
};

export const updateExpenseCategory = async ({ id, name }: { id: string; name: string }): Promise<ExpenseCategory> => {
  const response = await api.patch(`${API_BASE}/expense-categories/${id}/`, { name });
  return response.data.data || response.data;
};

export const deleteExpenseCategory = async (id: string) => {
  await api.delete(`${API_BASE}/expense-categories/${id}/`);
  return { success: true };
};
