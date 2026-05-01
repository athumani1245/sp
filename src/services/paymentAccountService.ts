import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

export interface PaymentAccountData {
  provider: string;
  payment_number: string;
  account_name: string;
  provider_type: string;
}

export const getPaymentAccounts = async () => {
  const response = await api.get(`${API_BASE}/payment-accounts/`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : (data.items || data.results || []);
};

export const getPaymentAccountById = async (id: string) => {
  const response = await api.get(`${API_BASE}/payment-accounts/${id}/`);
  return response.data.data || response.data;
};

export const createPaymentAccount = async (accountData: PaymentAccountData) => {
  const response = await api.post(`${API_BASE}/payment-accounts/`, accountData);
  return response.data.data || response.data;
};

export const updatePaymentAccount = async ({ id, accountData }: { id: string; accountData: Partial<PaymentAccountData> }) => {
  const response = await api.patch(`${API_BASE}/payment-accounts/${id}/`, accountData);
  return response.data.data || response.data;
};

export const deletePaymentAccount = async (id: string) => {
  await api.delete(`${API_BASE}/payment-accounts/${id}/`);
  return { success: true };
};
