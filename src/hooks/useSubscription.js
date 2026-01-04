import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for subscription-related functionality
 */
export const useSubscription = () => {
    const { subscription, hasActiveSubscription } = useAuth();

    const isFeatureEnabled = () => {
        return hasActiveSubscription;
    };

    const getSubscriptionStatus = () => {
        if (!subscription) {
            return {
                isActive: false,
                message: 'No subscription found',
                variant: 'danger'
            };
        }

        // Check if subscription is not active or has no days left
        if (!subscription.is_active || subscription.days_left <= 0) {
            return {
                isActive: false,
                message: 'Subscription expired',
                variant: 'danger'
            };
        }

        // Check if subscription is in trial mode
        if (subscription.is_trial) {
            if (subscription.days_left <= 7) {
                return {
                    isActive: true,
                    message: `Trial expires in ${subscription.days_left} day${subscription.days_left !== 1 ? 's' : ''}`,
                    variant: 'warning'
                };
            }
            return {
                isActive: true,
                message: `Trial (${subscription.days_left} days left)`,
                variant: 'info'
            };
        }

        // Active subscription with less than 7 days
        if (subscription.days_left <= 7) {
            return {
                isActive: true,
                message: `Expires in ${subscription.days_left} day${subscription.days_left !== 1 ? 's' : ''}`,
                variant: 'warning'
            };
        }

        return {
            isActive: true,
            message: 'Active',
            variant: 'success'
        };
    };

    const canAccessFeature = (requiredStatus = 'active') => {
        if (requiredStatus === 'active') {
            return hasActiveSubscription;
        }
        return true;
    };

    const getRemainingUnits = () => {
        if (!subscription) return 0;
        return subscription.max_units || 0;
    };

    const getPackageName = () => {
        if (!subscription) return null;
        return subscription.package_name || subscription.package?.name || null;
    };

    const getPlanName = () => {
        if (!subscription) return null;
        return subscription.plan_name || subscription.plan?.name || null;
    };

    const getDaysRemaining = () => {
        if (!subscription) return 0;
        return subscription.days_left || 0;
    };

    return {
        subscription,
        hasActiveSubscription,
        isFeatureEnabled,
        getSubscriptionStatus,
        canAccessFeature,
        getRemainingUnits,
        getPackageName,
        getPlanName,
        getDaysRemaining
    };
};
