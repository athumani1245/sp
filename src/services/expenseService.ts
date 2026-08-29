import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

export interface ExpenseData {
  properties: string[];
  units?: string[];
  category?: string | null;
  description?: string;
  amount: number | string;
  date: string;
}

export const getExpenses = async () => {
  const response = await api.get(`${API_BASE}/expenses/`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : (data.items || data.results || []);
};

export const addExpense = async (expenseData: ExpenseData) => {
  const response = await api.post(`${API_BASE}/expenses/`, expenseData);
  return response.data.data || response.data;
};

export const deleteExpense = async (expenseId: string) => {
  await api.delete(`${API_BASE}/expenses/${expenseId}/`);
  return { success: true };
};
