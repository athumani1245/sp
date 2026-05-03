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
  const { isSubscriptionExpired } = useAuth();

  if (isSubscriptionExpired) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGate;
