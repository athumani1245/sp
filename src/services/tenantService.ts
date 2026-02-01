import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

interface TenantData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  national_id?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
  status?: string;
}

interface TenantParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

interface LeaseParams {
  page?: number;
  limit?: number;
  status?: string;
}

// Get all tenants with optional filtering and pagination
export const getTenants = async (params: TenantParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);

  const response = await api.get(`${API_BASE}/tenants/?${queryParams.toString()}`);
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

// Get all tenants without pagination (for dropdowns/selects)
export const getAllTenants = async () => {
  const response = await api.get(`${API_BASE}/tenants/`);
  return response.data.data || [];
};

// Get a single tenant by ID
export const getTenantById = async (tenantId: string) => {
  const response = await api.get(`${API_BASE}/tenants/${tenantId}/`);
  return response.data.data || response.data;
};

// Create a new tenant
export const createTenant = async (tenantData: TenantData) => {
  const response = await api.post(`${API_BASE}/auth/register-tenant/`, tenantData);
  return response.data.data;
};

// Update an existing tenant
export const updateTenant = async ({ tenantId, tenantData }: { tenantId: string; tenantData: TenantData }) => {
  const response = await api.patch(`${API_BASE}/tenants/${tenantId}/`, tenantData);
  return response.data.data;
};

// Delete a tenant
export const deleteTenant = async (tenantId: string) => {
  await api.delete(`${API_BASE}/tenants/${tenantId}/`);
  return { success: true };
};

// Get tenant's lease history
export const getTenantLeases = async (tenantId: string, params: LeaseParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);

  const response = await api.get(`${API_BASE}/tenants/${tenantId}/leases/?${queryParams.toString()}`);
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
