import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

// Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDateForApi = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Input format is YYYY-MM-DD, convert to DD-MM-YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString; // Return original if formatting fails
  }
};

// Helper function to format lease data for API
const formatLeaseData = (leaseData: LeaseData) => {
  return {
    start_date: formatDateForApi(leaseData.start_date || ''),
    end_date: formatDateForApi(leaseData.end_date || ''),
    first_name: `${leaseData.first_name || ''}`.trim(),
    last_name: `${leaseData.last_name || ''}`.trim(),
    tenant_phone: leaseData.tenant_phone || '',
    rent_amount_per_unit: parseFloat(String(leaseData.rent_amount_per_unit || 0)).toString(),
    discount: parseFloat(String(leaseData.discount || 0)).toString(),
    unit: leaseData.unit || leaseData.unit_id || '',
    number_of_month: parseInt(String(leaseData.number_of_month || 0)).toString(),
    total_amount: parseFloat(String(leaseData.total_amount || 0)).toString(),
    amount_paid: parseFloat(String(leaseData.amount_paid || 0)).toString(),
    payments: (leaseData.payments || []).map((payment: any) => ({
      payment_date: formatDateForApi(payment.payment_date || ''),
      category: payment.category,
      payment_source: payment.payment_source,
      amount_paid: payment.amount_paid,
    })),
  };
};

interface LeaseData {
  property_id?: string;
  unit_id?: string;
  tenant_id?: string;
  start_date?: string;
  end_date?: string;
  first_name?: string;
  last_name?: string;
  tenant_phone?: string;
  number_of_month?: number;
  rent_amount_per_unit?: number;
  total_amount?: number;
  discount?: number;
  amount_paid?: number;
  payments?: any[];
  status?: string;
  unit?: string;
}

interface LeaseParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  property?: string;
  tenant?: string;
}

interface PaymentParams {
  page?: number;
  limit?: number;
  status?: string;
}

// Get all leases with optional filtering and pagination
export const getLeases = async (params: LeaseParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.property) queryParams.append('property', params.property);
  if (params.tenant) queryParams.append('tenant', params.tenant);
  
  // Include payments in the response
  queryParams.append('include_payments', 'true');

  const response = await api.get(`/leases/?${queryParams.toString()}`);
  return {
    items: response.data.data.items || [],
    pagination: {
      total: response.data.data.count,
      current_page: response.data.data.current_page,
      total_pages: response.data.data.total_pages,
      next: response.data.data.next,
      previous: response.data.data.previous,
    },
  };
};

// Get a single lease by ID
export const getLeaseById = async (leaseId: string) => {
  // Include payments in the query to ensure they're returned
  const response = await api.get(`/leases/${leaseId}/?include_payments=true`);
  return response.data.data || response.data;
};

// Create a new lease
export const createLease = async (leaseData: LeaseData) => {
  console.log('Original lease data:', leaseData);
  const formattedData = formatLeaseData(leaseData);
  console.log('Formatted lease data:', formattedData);
  const response = await api.post(`/v1/leases/create`, formattedData);
  return response.data.data;
};

// Update an existing lease
export const updateLease = async ({ leaseId, leaseData }: { leaseId: string; leaseData: LeaseData }) => {
  const response = await api.patch(`/leases/${leaseId}/`, leaseData);
  return response.data.data;
};

// Delete a lease
export const deleteLease = async (leaseId: string) => {
  await api.delete(`/leases/${leaseId}/`);
  return { success: true };
};

// Cancel a lease
export const cancelLease = async (leaseId: string) => {
  const response = await api.post(`/leases/${leaseId}/cancel/`);
  return response.data.data;
};

// Renew a lease
export const renewLease = async ({ leaseId, renewalData }: { leaseId: string; renewalData: any }) => {
  const response = await api.post(`/leases/renew/`, renewalData);
  return response.data.data;
};

// Get lease payments
export const getLeasePayments = async (leaseId: string, params: PaymentParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);

  const response = await api.get(`/leases/${leaseId}/payments/?${queryParams.toString()}`);
  return {
    items: response.data.data.items || [],
    pagination: {
      total: response.data.data.count,
      current_page: response.data.data.current_page,
      total_pages: response.data.data.total_pages,
      next: response.data.data.next,
      previous: response.data.data.previous,
    },
  };
};


// Cancel a payment
export const cancelPayment = async (paymentId: string) => {
  const response = await api.post(`/payments/${paymentId}/cancel/`, {});
  return response.data.data || { success: true };
};

// Get lease report
export const getLeaseReport = async () => {
  const response = await api.get(`/reports/lease`);
  return response.data.data || [];
};
