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

export interface Expense {
  id: string;
  properties: string[];
  units: string[];
  amount: string | number;
  category: string | null;
  description?: string;
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

export const updateExpense = async ({
  expenseId,
  expenseData,
}: {
  expenseId: string;
  expenseData: Partial<ExpenseData>;
}) => {
  const response = await api.patch(`${API_BASE}/expenses/${expenseId}/`, expenseData);
  return response.data.data || response.data;
};

export const deleteExpense = async (expenseId: string) => {
  await api.delete(`${API_BASE}/expenses/${expenseId}/`);
  return { success: true };
};

// Get expense report
const joinNames = (value: any): string => {
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v : v?.name ?? v?.property_name ?? v?.unit_name ?? '')).filter(Boolean).join(', ');
  }
  if (value && typeof value === 'object') return value.name ?? '';
  return value ?? '';
};

export const getExpenseReport = async () => {
  const response = await api.get(`/reports/expense`);
  const raw = response.data.data;
  const data = Array.isArray(raw) ? raw : (raw?.items || raw?.results || []);
  return data.map((item: any, index: number) => ({
    id: String(item.id ?? `expense-${index}`),
    date: item.date ?? item.expense_date ?? item.created_at ?? '',
    property: joinNames(item.properties ?? item.property ?? item.property_name),
    unit: joinNames(item.units ?? item.unit ?? item.unit_name),
    category: (typeof item.category === 'object' ? item.category?.name : item.category) ?? item.category_name ?? '',
    description: item.description ?? '',
    amount: parseFloat(item.amount) || 0,
  }));
};
