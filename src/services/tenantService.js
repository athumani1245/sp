import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const API_BASE = process.env.REACT_APP_API_BASE;

// Get all tenants with optional filtering and pagination
export const getTenants = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add pagination
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Add search filter
        if (params.search) queryParams.append('search', params.search);
        
        // Add status filter
        if (params.status) queryParams.append('status', params.status);
        
        const url = `${API_BASE}/tenants/?${queryParams.toString()}`;
        
        const response = await api.get(url);
        
        return {
            success: true,
            data: response.data.data || response.data.results || [],
            pagination: response.data.pagination || {},
            message: "Tenants fetched successfully"
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch tenants.");
    }
};

// Get a single tenant by ID
export const getTenantById = async (tenantId) => {
    try {
        const response = await api.get(`${API_BASE}/tenants/${tenantId}/`);

        return {
            success: true,
            data: response.data.data || response.data,
            message: "Tenant details fetched successfully"
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch tenant details.");
    }
};

// Create a new tenant
export const createTenant = async (tenantData) => {
    try {
        const response = await api.post(`${API_BASE}/auth/register-tenant/`, tenantData);

        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message || "Tenant created successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to create tenant.");
    }
};

// Update an existing tenant
export const updateTenant = async (tenantId, tenantData) => {
    try {
        const response = await api.patch(`${API_BASE}/tenants/${tenantId}/`, tenantData);

        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message || "Tenant updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update tenant.");
    }
};

// Delete a tenant
export const deleteTenant = async (tenantId) => {
    try {
        const response = await api.delete(`${API_BASE}/tenants/${tenantId}/`);

        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message || "Tenant deleted successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete tenant.");
    }
};

// Get tenant's lease history
export const getTenantLeases = async (tenantId, params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        
        const url = `${API_BASE}/tenants/${tenantId}/leases/?${queryParams.toString()}`;
        
        const response = await api.get(url);

        return {
            success: true,
            data: response.data.data || response.data.results || [],
            pagination: response.data.pagination || {},
            message: "Tenant leases fetched successfully"
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch tenant leases.");
    }
};

