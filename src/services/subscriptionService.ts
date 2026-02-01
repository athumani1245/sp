import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

interface SubscriptionData {
  plan: number;
  phone_number: string;
  auto_renew?: boolean;
}

interface SubscriptionResponse {
  success: boolean;
  data?: any;
  description?: string;
  message?: string;
  status?: number;
  transactionId?: string;
  requiresUserAction?: boolean;
}

// Helper function to format subscription data for API
const formatSubscriptionData = (subscriptionData: SubscriptionData) => {
  return {
    plan_id: subscriptionData.plan,
    phone_number: subscriptionData.phone_number || '',
  };
};

// Get license status
export const getLicenseStatus = async () => {
  try {
    const response = await api.get(`${API_BASE}/subscriptions/active/`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to fetch license status.';
    return {
      success: false,
      error: description,
    };
  }
};

// Get available subscription plans (packages with optional plans)
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get(`${API_BASE}/packages/`);

    // Transform the data to ensure consistent structure
    const packages = response.data.data.map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price ? parseFloat(pkg.price) : null,
      duration_days: pkg.duration_days || null,
      max_units: pkg.max_units || null,
      max_property_managers: pkg.max_property_managers || null,
      allow_sms_notifications: pkg.allow_sms_notifications || false,
      number_sms: pkg.number_sms || null,
      // Preserve nested plans array if it exists
      plans: pkg.plans
        ? pkg.plans.map((plan: any) => {
            // Calculate duration in days from duration_value and duration_unit
            let durationDays = 30; // default
            if (plan.duration_value && plan.duration_unit) {
              const unit = plan.duration_unit.toUpperCase();
              if (unit === 'MONTHS') {
                durationDays = plan.duration_value * 30;
              } else if (unit === 'DAYS') {
                durationDays = plan.duration_value;
              } else if (unit === 'YEARS') {
                durationDays = plan.duration_value * 365;
              }
            }

            return {
              id: plan.id,
              name: plan.name,
              description: plan.description || '',
              price: parseFloat(plan.discounted_price || plan.full_price || 0),
              duration_days: durationDays,
              max_units: plan.total_max_units || plan.max_units || null,
              max_property_managers: plan.max_property_managers || null,
              allow_sms_notifications: plan.allow_sms_notifications || false,
              number_sms: plan.number_sms || null,
              full_price: plan.full_price ? parseFloat(plan.full_price) : null,
              discount_amount: plan.discount_amount ? parseFloat(plan.discount_amount) : null,
              discounted_price: plan.discounted_price ? parseFloat(plan.discounted_price) : null,
            };
          })
        : [],
    }));

    return {
      success: true,
      data: packages,
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to fetch subscription plans.';
    return {
      success: false,
      error: description,
    };
  }
};

// Get current subscription
export const getCurrentSubscription = async () => {
  try {
    const response = await api.get(`${API_BASE}/subscriptions/active/`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to fetch current subscription.';
    return {
      success: false,
      error: description,
    };
  }
};

// Create new subscription
export const createSubscription = async (subscriptionData: SubscriptionData): Promise<SubscriptionResponse> => {
  try {
    const formattedData = formatSubscriptionData(subscriptionData);

    const response = await api.post(`${API_BASE}/subscribe/initiate/`, formattedData);

    const responseData = response.data;

    return {
      success: true,
      data: responseData.data,
      description: responseData.description || responseData.message,
      message: responseData.message || 'Subscription initiated successfully!',
      status: response.status,
      transactionId: responseData.transaction_ref || responseData.data?.transaction_ref,
      requiresUserAction: response.status === 200 && responseData.description,
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to create subscription.';
    return {
      success: false,
      message: description,
    };
  }
};

// Get billing history
export const getBillingHistory = async () => {
  try {
    const response = await api.get(`${API_BASE}/payments-history/`);
    return {
      success: true,
      data: response.data.data || [],
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to fetch billing history.';
    return {
      success: false,
      error: description,
    };
  }
};

// Check payment status for a specific transaction
export const checkPaymentStatus = async (transactionId: string) => {
  try {
    const response = await api.get(`${API_BASE}/subscribe/status/${transactionId}/`);

    const responseData = response.data;

    return {
      success: responseData.status === true,
      statusCode: responseData.statusCode || response.status,
      description: responseData.description,
      paymentStatus: responseData.data?.status,
      message: responseData.description || responseData.data?.narration,
      data: responseData.data,
      transactionId: transactionId,
      transactionRef: responseData.data?.transaction_ref,
      amount: responseData.data?.amount,
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to check payment status.';
    return {
      success: false,
      error: description,
    };
  }
};

// Global storage for active payment listeners
const activePaymentListeners = new Map();

interface PaymentStatusListenerOptions {
  pollInterval?: number;
  maxAttempts?: number;
  onTimeout?: (result: any) => void;
  onError?: (result: any) => void;
}

// Start monitoring payment status with polling
export const startPaymentStatusListener = (
  transactionId: string,
  callback: (result: any) => void,
  options: PaymentStatusListenerOptions = {}
) => {
  const { pollInterval = 3000, maxAttempts = 20, onTimeout = null, onError = null } = options;

  let attempts = 0;
  let isActive = true;

  const pollPaymentStatus = async () => {
    if (!isActive || attempts >= maxAttempts) {
      if (attempts >= maxAttempts && onTimeout) {
        onTimeout({
          success: false,
          error: 'Payment status check timed out',
          transactionId,
        });
      }
      stopPaymentStatusListener(transactionId);
      return;
    }

    attempts++;

    try {
      const result = await checkPaymentStatus(transactionId);

      if (result.success) {
        callback(result);

        const paymentStatus = result.paymentStatus?.toUpperCase();
        if (
          paymentStatus === 'PAYMENT_ACCEPTED' ||
          paymentStatus === 'PAYMENT_SUCCESS' ||
          paymentStatus === 'PAYMENT_FAILED' ||
          paymentStatus === 'PAYMENT_CANCELLED'
        ) {
          stopPaymentStatusListener(transactionId);
          return;
        }
      } else {
        if (onError) {
          onError(result);
        }
      }
    } catch (error) {
      if (onError) {
        onError({
          success: false,
          error: 'Failed to check payment status',
          transactionId,
        });
      }
    }

    if (isActive) {
      setTimeout(pollPaymentStatus, pollInterval);
    }
  };

  activePaymentListeners.set(transactionId, {
    isActive: () => isActive,
    stop: () => {
      isActive = false;
    },
  });

  pollPaymentStatus();

  return {
    transactionId,
    stop: () => stopPaymentStatusListener(transactionId),
    isActive: () => isActive,
  };
};

// Stop monitoring payment status
export const stopPaymentStatusListener = (transactionId: string) => {
  const listener = activePaymentListeners.get(transactionId);
  if (listener) {
    listener.stop();
    activePaymentListeners.delete(transactionId);
  }
};

// Stop all active payment listeners
export const stopAllPaymentListeners = () => {
  activePaymentListeners.forEach((listener) => {
    listener.stop();
  });
  activePaymentListeners.clear();
};
