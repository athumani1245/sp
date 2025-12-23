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









/////////////////////////////////////////////////////////// Error Handling //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helper function to handle errors consistently
const handleApiError = (err, defaultMessage) => {
    let error_msg = defaultMessage;
    
    if (err.response?.data?.description) {
        error_msg = err.response.data.description;
    } else if (err.response?.status === 401) {
        error_msg = "Session expired. Please login again.";
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
    } else if (err.response?.status === 404) {
        error_msg = "Resource not found.";
    } else if (err.response?.status === 400) {
        error_msg = "Invalid data. Please check your input.";
    } else if (err.response?.status === 403) {
        error_msg = "You don't have permission to perform this action.";
    } else if (err.response?.status === 409) {
        error_msg = "Lease already exists for this unit.";
    }
    
    return {
        success: false,
        error: error_msg
    };
};



////////////////////////////////////////////// Data Validation and Handling /////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDateForApi = (dateString) => {
    if (!dateString) return "";
    
    try {
        // Input format is YYYY-MM-DD, convert to DD-MM-YYYY
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString; // Return original if formatting fails
    }
};

// Helper function to format lease data for API
const formatLeaseData = (leaseData) => {
    return {
        start_date: formatDateForApi(leaseData.start_date),
        end_date: formatDateForApi(leaseData.end_date),
        first_name: `${leaseData.first_name}`.trim(),
        last_name: `${leaseData.last_name}`.trim(),
        tenant_phone: leaseData.tenant_phone || "",
        rent_amount_per_unit: parseFloat(leaseData.rent_amount_per_unit).toString(),
        discount: parseFloat(leaseData.discount || 0).toString(),
        unit: leaseData.unit || "",
        number_of_month: parseInt(leaseData.number_of_month || 0).toString(),
        total_amount: parseFloat(leaseData.total_amount || 0).toString(),
        amount_paid: parseFloat(leaseData.amount_paid || 0).toString(),
        payments: leaseData.payments || [],
    };
};






///////////////////////////////////////////////////////////////////// Service Functions ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create a new lease
export const createLease = async (leaseData) => {
    try {
        // Format lease data
        const formattedData = formatLeaseData(leaseData);
        
        const response = await axios.post(
            `${API_BASE}/v1/leases/create`,
            formattedData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Lease created successfully!"
        };  
    } catch (err) {
        return handleApiError(err, "Failed to create lease.");
    }
};



// Get all leases
export const getLeases = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        if (params.property_id) queryParams.append('property_id', params.property_id);
        if (params.tenant_name) queryParams.append('tenant_name', params.tenant_name);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const response = await axios.get(
            `${API_BASE}/leases/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch leases.");
    }
};

// Get all leases without pagination (for summary statistics)
export const getAllLeases = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add filters but no pagination parameters
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.property_id) queryParams.append('property_id', filters.property_id);
        if (filters.tenant_name) queryParams.append('tenant_name', filters.tenant_name);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        
        // Use a very high limit to get all records, or don't include limit at all
        queryParams.append('limit', '10000'); // High limit to ensure we get all records

        const response = await axios.get(
            `${API_BASE}/leases/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            count: response.data.pagination?.count || (response.data.data?.items || response.data.data || []).length
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch all leases.");
    }
};




// Get a single lease by ID
export const getLeaseById = async (leaseId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/leases/${leaseId}/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch lease details.");
    }
};





// Update a lease
export const updateLease = async (leaseId, leaseData) => {
    try {
        const formattedData = formatLeaseData(leaseData);

        const response = await axios.patch(
            `${API_BASE}/leases/${leaseId}/`,
            formattedData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Lease updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update lease.");
    }
};





// Delete a lease
export const deleteLease = async (leaseId) => {
    try {
        await axios.delete(
            `${API_BASE}/leases/${leaseId}/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            message: "Lease deleted successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete lease.");
    }
};






// Terminate a lease
export const terminateLease = async (leaseId, terminationData = {}) => {
    try {
        const formattedDate = formatDateForApi(terminationData.termination_date || new Date().toISOString().split('T')[0]);
        
        const response = await axios.post(
            `${API_BASE}/leases/terminate/`,
            {
                termination_date: formattedDate,
                reason: terminationData.reason || "",
                lease: leaseId || 0
            },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Lease terminated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to terminate lease.");
    }
};


// Cancel lease
export const cancelLease = async (leaseId) => {
    try {
        const response = await axios.post(
            `${API_BASE}/leases/${leaseId}/cancel/`,
            {},
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Lease cancelled successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to cancel lease.");
    }
};







// Renew a lease
export const renewLease = async (leaseId, renewalData) => {
    try {
        const response = await axios.post(
            `${API_BASE}/leases/renew/`,
            renewalData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.description || "Lease renewed successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to renew lease.");
    }
};




// Get lease payments
export const getLeasePayments = async (leaseId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/leases/${leaseId}/payments/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch lease payments.");
    }
};



// Record a lease payment
export const recordLeasePayment = async (leaseId, paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE}/leases/${leaseId}/payments/`,
            {
                amount: parseFloat(paymentData.amount),
                payment_date: paymentData.payment_date,
                payment_method: paymentData.payment_method || 'cash',
                reference_number: paymentData.reference_number || "",
                notes: paymentData.notes || ""
            },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Payment recorded successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to record payment.");
    }
};



// Get lease documents
export const getLeaseDocuments = async (leaseId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/leases/${leaseId}/documents/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch lease documents.");
    }
};




// Upload lease document
export const uploadLeaseDocument = async (leaseId, documentData) => {
    try {
        const formData = new FormData();
        formData.append('file', documentData.file);
        formData.append('document_type', documentData.document_type);
        formData.append('description', documentData.description || '');

        const response = await axios.post(
            `${API_BASE}/leases/${leaseId}/documents/`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Document uploaded successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to upload document.");
    }
};



// Delete lease document
export const deleteLeaseDocument = async (leaseId, documentId) => {
    try {
        await axios.delete(
            `${API_BASE}/leases/${leaseId}/documents/${documentId}/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            message: "Document deleted successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete document.");
    }
};





// Generate lease agreement document
export const generateLeaseAgreement = async (leaseId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/leases/${leaseId}/generate-agreement/`,
            {
                headers: getAuthHeaders(),
                responseType: 'blob'
            }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lease-agreement-${leaseId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Lease agreement generated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to generate lease agreement.");
    }
};

// Get lease statistics
export const getLeaseStats = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.property_id) queryParams.append('property_id', params.property_id);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const response = await axios.get(
            `${API_BASE}/leases/stats/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch lease statistics.");
    }
};

// Get expiring leases
export const getExpiringLeases = async (days = 30) => {
    try {
        const response = await axios.get(
            `${API_BASE}/leases/expiring/?days=${days}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch expiring leases.");
    }
};

// Get overdue payments
export const getOverduePayments = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/leases/overdue-payments/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch overdue payments.");
    }
};

// Search leases
export const searchLeases = async (searchQuery, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('q', searchQuery);
        
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.property_id) queryParams.append('property_id', filters.property_id);
        if (filters.tenant_name) queryParams.append('tenant_name', filters.tenant_name);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        if (filters.min_rent) queryParams.append('min_rent', filters.min_rent);
        if (filters.max_rent) queryParams.append('max_rent', filters.max_rent);

        const response = await axios.get(
            `${API_BASE}/leases/search/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to search leases.");
    }
};

// Bulk operations
export const bulkUpdateLeaseStatus = async (leaseIds, status) => {
    try {
        await axios.post(
            `${API_BASE}/leases/bulk-update-status/`,
            { 
                lease_ids: leaseIds,
                status: status
            },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            message: `${leaseIds.length} leases updated successfully!`
        };
    } catch (err) {
        return handleApiError(err, "Failed to update lease statuses.");
    }
};

export const bulkDeleteLeases = async (leaseIds) => {
    try {
        await axios.post(
            `${API_BASE}/leases/bulk-delete/`,
            { lease_ids: leaseIds },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            message: `${leaseIds.length} leases deleted successfully!`
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete leases.");
    }
};

// Export leases data
export const exportLeases = async (format = 'csv', filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('format', format);
        
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.property_id) queryParams.append('property_id', filters.property_id);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);

        const response = await axios.get(
            `${API_BASE}/leases/export/?${queryParams.toString()}`,
            {
                headers: getAuthHeaders(),
                responseType: 'blob'
            }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `leases.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Leases exported successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to export leases.");
    }
};

// Send lease notification
export const sendLeaseNotification = async (leaseId, notificationData) => {
    try {
        const response = await axios.post(
            `${API_BASE}/leases/${leaseId}/notifications/`,
            {
                notification_type: notificationData.notification_type,
                message: notificationData.message,
                send_via: notificationData.send_via || ['email'] // email, sms, both
            },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Notification sent successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to send notification.");
    }
};

// Get tenant lease history
export const getTenantLeaseHistory = async (tenantId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/tenants/${tenantId}/lease-history/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch tenant lease history.");
    }
};

// Generate rent receipt
export const generateRentReceipt = async (paymentId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/payments/${paymentId}/receipt/`,
            {
                headers: getAuthHeaders(),
                responseType: 'blob'
            }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rent-receipt-${paymentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Receipt generated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to generate receipt.");
    }
};

// Fetch lease report data
export const getLeaseReportData = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add filters but no pagination parameters
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.property_id) queryParams.append('property_id', filters.property_id);
        if (filters.tenant_name) queryParams.append('tenant_name', filters.tenant_name);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        

        const response = await axios.get(
            `${API_BASE}/reports/lease`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            count: response.data.pagination?.count || (response.data.data?.items || response.data.data || []).length
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch all leases.");
    }
};
