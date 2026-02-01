import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * SubscriptionGate Component
 * Protects routes that require an active subscription
 * Redirects to subscription page if subscription is expired
 */
const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { hasActiveSubscription, subscription } = useAuth();

  // Check if subscription is expired
  const isExpired = 
    subscription?.is_active === false || 
    (subscription?.days_left !== undefined && subscription.days_left <= 0) ||
    (!subscription?.is_active && !hasActiveSubscription);

  if (isExpired) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGate;
