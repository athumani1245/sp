import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { refreshToken } from '../services/authService';

interface Subscription {
  plan: string;
  status: string;
  end_date: string;
  start_date?: string;
  package_name?: string;
  plan_name?: string;
  max_units?: number;
  max_property_managers?: number;
  days_left?: number;
  is_trial?: boolean;
  is_active?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setSubscription: (value: Subscription | null) => void;
  checkAuthentication: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const checkAuthentication = useCallback(async () => {
    const token = localStorage.getItem('token');
    const refresh = localStorage.getItem('refresh');
    const subscriptionData = localStorage.getItem('subscription');

    if (token && refresh) {
      setIsAuthenticated(true);

      // Load subscription data
      if (subscriptionData) {
        try {
          const parsedSubscription = JSON.parse(subscriptionData);
          setSubscription(parsedSubscription);
          
          // Check if subscription is active based on is_active flag and days_left
          const isActive = 
            (parsedSubscription.is_active === true || parsedSubscription.status === 'active') &&
            (parsedSubscription.days_left === undefined || parsedSubscription.days_left > 0);
          
          setHasActiveSubscription(isActive);
        } catch (error) {
          console.error('Error parsing subscription data:', error);
        }
      }
    } else {
      setIsAuthenticated(false);
      setSubscription(null);
      setHasActiveSubscription(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const setupInterceptor = async () => {
      // This is handled in utils/api.ts
      // The interceptor will automatically refresh tokens when needed
    };

    setupInterceptor();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    subscription,
    hasActiveSubscription,
    setIsAuthenticated,
    setSubscription,
    checkAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
