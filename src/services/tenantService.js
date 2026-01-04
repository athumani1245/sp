import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Helper function to handle errors consistently
const handleApiError = (err, defaultMessage) => {
    let error_msg = defaultMessage;
    
    if (err.response?.data?.description) {
        error_msg = err.response.data.description;
    } else if (err.response?.status === 401) {
        error_msg = "Session expired. Please login again.";
    } else if (err.response?.data?.error) {
        error_msg = err.response.data.error;
    } else if (err.response?.data?.message) {
        error_msg = err.response.data.message;
    } else if (err.message) {
        error_msg = err.message;
    }
    
    return {
        success: false,
        error: error_msg,
        status: err.response?.status
    };
};

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
        
        const response = await axios.get(url, { headers: getAuthHeaders() });
        
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
        const response = await axios.get(
            `${API_BASE}/tenants/${tenantId}/`,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.post(
            `${API_BASE}/auth/register-tenant/`,
            tenantData,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.patch(
            `${API_BASE}/tenants/${tenantId}/`,
            tenantData,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.delete(
            `${API_BASE}/tenants/${tenantId}/`,
            { headers: getAuthHeaders() }
        );

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
        
        const response = await axios.get(url, { headers: getAuthHeaders() });

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
