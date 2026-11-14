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
export const createTenant = async (tenantData: TenantData | FormData) => {
  // The default JSON header would make axios serialise FormData to JSON.
  const headers = tenantData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const response = await api.post(`${API_BASE}/auth/register-tenant/`, tenantData, { headers });
  return response.data.data;
};

// Update an existing tenant
export const updateTenant = async ({ tenantId, tenantData }: { tenantId: string; tenantData: TenantData }) => {
  const response = await api.patch(`${API_BASE}/tenants/${tenantId}/`, tenantData);
  return response.data.data;
};

// Replace (file) or remove (null) the tenant's photo, separately from the other details
export const updateTenantPhoto = async ({ tenantId, photo }: { tenantId: string; photo: File | null }) => {
  if (photo) {
    const formData = new FormData();
    formData.append('file', photo);
    const response = await api.patch(`${API_BASE}/tenants/${tenantId}/passport-photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }
  const response = await api.delete(`${API_BASE}/tenants/${tenantId}/passport-photo/`);
  return response.data?.data;
};

// ---------- Identification files ----------

export interface TenantIdentificationFile {
  id: string;
  file_name: string;
  url: string;
  attachment_type?: string | null;
  mime_type?: string;
}

const normalizeIdentificationFile = (item: any): TenantIdentificationFile => {
  const url = item.url ?? item.file ?? '';
  return {
    id: String(item.id),
    url,
    file_name: item.file_name || decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file'),
    attachment_type: item.attachment_type ?? null,
    mime_type: item.mime_type ?? item.content_type,
  };
};

const multipartHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };

// List all ID files
export const getTenantIdentificationFiles = async (tenantId: string): Promise<TenantIdentificationFile[]> => {
  const response = await api.get(`${API_BASE}/tenants/${tenantId}/identification/`);
  const raw = response.data?.data ?? response.data;
  const items = Array.isArray(raw) ? raw : (raw?.attachments || raw?.items || raw?.results || []);
  return items.map(normalizeIdentificationFile);
};

// Replace all ID files with a new set
export const replaceTenantIdentificationFiles = async ({ tenantId, files }: { tenantId: string; files: File[] }) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const response = await api.put(`${API_BASE}/tenants/${tenantId}/identification/`, formData, multipartHeaders);
  return response.data?.data;
};

// Replace one ID file
export const updateTenantIdentificationFile = async ({
  tenantId,
  attachmentId,
  file,
}: {
  tenantId: string;
  attachmentId: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.patch(
    `${API_BASE}/tenants/${tenantId}/identification/${attachmentId}/`,
    formData,
    multipartHeaders,
  );
  return response.data?.data;
};

// Delete one ID file
export const deleteTenantIdentificationFile = async ({ tenantId, attachmentId }: { tenantId: string; attachmentId: string }) => {
  await api.delete(`${API_BASE}/tenants/${tenantId}/identification/${attachmentId}/`);
  return { success: true };
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
