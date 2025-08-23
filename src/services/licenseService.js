import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;
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

// Helper function to format subscription data for API
const formatSubscriptionData = (subscriptionData) => {
    return {
        plan_id: subscriptionData.plan,
        phone_number: subscriptionData.phone_number || '',
        
    };
};

///////////////////////////////////////////////////////////////////// Service Functions ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Get license status
export const getLicenseStatus = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/subscriptions/active/`,
            { headers: getAuthHeaders() }
        );
        console.log("License Status Response:", response.data);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch license status.");
    }
};

// Get available subscription plans
export const getSubscriptionPlans = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/plans/`,
            { headers: getAuthHeaders() }
        );

        // Transform the data to ensure consistent structure
        const plans = response.data.data.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: parseFloat(plan.price),
            duration_days: plan.duration_days || 30,
        }));

        console.log("Processed Subscription Plans:", plans);
        return {
            success: true,
            data: plans
        };
    } catch (err) {
        console.error("Error fetching subscription plans:", err);
        return handleApiError(err, "Failed to fetch subscription plans.");
    }
};

// Get current subscription
export const getCurrentSubscription = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/subscriptions/current/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch current subscription.");
    }
};

// Create new subscription
export const createSubscription = async (subscriptionData) => {
    try {
        const formattedData = formatSubscriptionData(subscriptionData);
        
        const response = await axios.post(
            `${API_BASE}/subscriptions/`,
            formattedData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Subscription created successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to create subscription.");
    }
};

// Update subscription
export const updateSubscription = async (subscriptionId, subscriptionData) => {
    try {
        const formattedData = formatSubscriptionData(subscriptionData);

        const response = await axios.patch(
            `${API_BASE}/subscriptions/${subscriptionId}/`,
            formattedData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Subscription updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update subscription.");
    }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId, reason = '') => {
    try {
        const response = await axios.post(
            `${API_BASE}/subscriptions/${subscriptionId}/cancel/`,
            { reason },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Subscription cancelled successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to cancel subscription.");
    }
};

// Renew subscription
export const renewSubscription = async (subscriptionId, renewalData) => {
    try {
        const response = await axios.post(
            `${API_BASE}/subscriptions/${subscriptionId}/renew/`,
            renewalData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Subscription renewed successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to renew subscription.");
    }
};

// Get subscription history
export const getSubscriptionHistory = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/subscriptions/history/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch subscription history.");
    }
};

// Validate coupon code
export const validateCouponCode = async (couponCode) => {
    try {
        const response = await axios.post(
            `${API_BASE}/subscriptions/validate-coupon/`,
            { coupon_code: couponCode },
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Coupon code is valid!"
        };
    } catch (err) {
        return handleApiError(err, "Invalid coupon code.");
    }
};

// Get subscription invoices
export const getSubscriptionInvoices = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/subscriptions/invoices/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch subscription invoices.");
    }
};

// Get subscription page URL
export const getSubscriptionUrl = () => {
    // You can modify this to return the appropriate URL based on your routing
    return '/subscription';
};

// Download invoice
export const downloadInvoice = async (invoiceId) => {
    try {
        const response = await axios.get(
            `${API_BASE}/subscriptions/invoices/${invoiceId}/download/`,
            {
                headers: getAuthHeaders(),
                responseType: 'blob'
            }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Invoice downloaded successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to download invoice.");
    }
};

// Get billing information
export const getBillingInfo = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/subscriptions/billing-info/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch billing information.");
    }
};

// Update billing information
export const updateBillingInfo = async (billingData) => {
    try {
        const response = await axios.patch(
            `${API_BASE}/subscriptions/billing-info/`,
            billingData,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            message: "Billing information updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update billing information.");
    }
};
