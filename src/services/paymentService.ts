import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

interface PaymentData {
  lease: string;
  amount_paid: number | string;
  date_paid: string;
  category?: string;
  payment_source?: string;
  status?: string;
}

interface PaymentParams {
  search?: string;
  page?: number;
  limit?: number;
  lease_id?: string;
  tenant_id?: string;
  property_id?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}

// Helper function to format payment data for API
const formatPaymentData = (paymentData: PaymentData) => {
  // Convert the date to dd-mm-yyyy format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return {
    lease: paymentData.lease,
    amount_paid: parseFloat(paymentData.amount_paid.toString()).toString(),
    status: paymentData.status || 'success',
    date_paid: formatDate(paymentData.date_paid || new Date().toISOString()),
    category: paymentData.category || 'RENT',
    payment_source: paymentData.payment_source || 'CASH',
  };
};

// Create a new payment
export const createPayment = async (paymentData: PaymentData) => {
  const formattedData = formatPaymentData(paymentData);
  const response = await api.post(`${API_BASE}/payments/`, formattedData);
  return response.data.data;
};

// Get all payments
export const getPayments = async (params: PaymentParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.lease_id) queryParams.append('lease_id', params.lease_id);
  if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id);
  if (params.property_id) queryParams.append('property_id', params.property_id);
  if (params.payment_method) queryParams.append('payment_method', params.payment_method);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);

  const response = await api.get(`${API_BASE}/payments/?${queryParams.toString()}`);
  
  return {
    items: response.data.data.items || response.data.data || [],
    pagination: {
      total: response.data.data.count || 0,
      current_page: response.data.data.current_page || 1,
      total_pages: response.data.data.total_pages || 1,
      next: response.data.data.next || null,
      previous: response.data.data.previous || null,
    },
  };
};

// Get a single payment by ID
export const getPaymentById = async (paymentId: string) => {
  const response = await api.get(`${API_BASE}/payments/${paymentId}/`);
  return response.data.data;
};

// Update a payment
export const updatePayment = async ({ paymentId, paymentData }: { paymentId: string; paymentData: PaymentData }) => {
  const formattedData = formatPaymentData(paymentData);
  const response = await api.patch(`${API_BASE}/payments/${paymentId}/`, formattedData);
  return response.data.data;
};

// Cancel a payment
export const cancelPayment = async (paymentId: string) => {
  await api.post(`${API_BASE}/payments/${paymentId}/cancel/`, {});
  return { success: true };
};

// Generate payment receipt
export const generatePaymentReceipt = async (paymentId: string) => {
  const response = await api.get(`${API_BASE}/payments/${paymentId}/receipt/`, {
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `payment-receipt-${paymentId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return { success: true };
};
