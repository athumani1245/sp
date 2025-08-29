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
    }
    
    return {
        success: false,
        error: error_msg
    };
};

////////////////////////////////////////////// Data Validation and Handling /////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helper function to format payment data for API
const formatPaymentData = (paymentData) => {
    // Convert the date to dd-mm-yyyy format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return {
        lease: paymentData.lease,
        amount_paid: parseFloat(paymentData.amount_paid).toString(),
        status: paymentData.status || 'success',
        date_paid: formatDate(paymentData.date_paid || new Date()),
        category: paymentData.category || 'RENT'
    };
};

///////////////////////////////////////////////////////////////////// Service Functions ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create a new payment
export const createPayment = async (paymentData) => {
    try {
        const formattedData = formatPaymentData(paymentData);
        
        const response = await axios.post(
            `${API_BASE}/payments/`,
            formattedData,
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

// Get all payments
export const getPayments = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.lease_id) queryParams.append('lease_id', params.lease_id);
        if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id);
        if (params.property_id) queryParams.append('property_id', params.property_id);
        if (params.payment_method) queryParams.append('payment_method', params.payment_method);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const response = await axios.get(
            `${API_BASE}/payments/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch payments.");
    }
};

// Get a single payment by ID
export const getPaymentById = async (paymentId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/payments/${paymentId}/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch payment details.");
    }
};

// Update a payment
export const updatePayment = async (paymentId, paymentData) => {
    try {
        const formattedData = formatPaymentData(paymentData);

        const response = await axios.patch(
            `${API_BASE}/payments/${paymentId}/`,
            formattedData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Payment updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update payment.");
    }
};

// Delete a payment
export const cancelPayment = async (paymentId) => {
    try {
        await axios.post(
            `${API_BASE}/payments/${paymentId}/cancel/`,
            {},  // empty body
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            message: "Payment cancelled successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to cancel payment.");
    }
};

// Generate payment receipt
export const generatePaymentReceipt = async (paymentId) => {
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
        link.setAttribute('download', `payment-receipt-${paymentId}.pdf`);
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

// Get payment statistics
export const getPaymentStats = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.property_id) queryParams.append('property_id', params.property_id);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const response = await axios.get(
            `${API_BASE}/payments/stats/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch payment statistics.");
    }
};



