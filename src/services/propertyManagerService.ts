import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

interface PropertyManagerData {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  email?: string;
  permissions?: string[];
}

interface PropertyManagerParams {
  search?: string;
  page?: number;
  limit?: number;
}

// Get all property managers with optional filtering and pagination
export const getPropertyManagers = async (params: PropertyManagerParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get(`${API_BASE}/property-managers/?${queryParams.toString()}`);
  const data = response.data.data || response.data;
  const items = Array.isArray(data) ? data : (data.items || data.results || []);
  return {
    items,
    pagination: {
      total: data.count || items.length,
      current_page: data.current_page || 1,
      total_pages: data.total_pages || 1,
      next: data.next || null,
      previous: data.previous || null,
    },
  };
};

// Get a single property manager by ID
export const getPropertyManagerById = async (managerId: string) => {
  const response = await api.get(`${API_BASE}/property-managers/${managerId}/`);
  return response.data.data || response.data;
};

// Register a new property manager
export const createPropertyManager = async (managerData: PropertyManagerData) => {
  const response = await api.post(`${API_BASE}/auth/register-property-manager/`, managerData);
  return response.data.data;
};

// Update an existing property manager
export const updatePropertyManager = async ({ managerId, managerData }: { managerId: string; managerData: Partial<PropertyManagerData> }) => {
  const response = await api.patch(`${API_BASE}/property-managers/${managerId}/`, managerData);
  return response.data.data;
};

// Delete a property manager
export const deletePropertyManager = async (managerId: string) => {
  await api.delete(`${API_BASE}/property-managers/${managerId}/`);
  return { success: true };
};

// Get available permissions
export const getPermissions = async () => {
  const response = await api.get(`${API_BASE}/permissions/`);
  return response.data.data || response.data;
};
