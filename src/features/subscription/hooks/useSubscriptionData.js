/**
 * useSubscriptionData Hook
 * Manages subscription and billing history data
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription, getBillingHistory } from '../../../services/licenseService';
import { ROUTES } from '../../../config/constants';

export const useSubscriptionData = () => {
  const [detailedSubscription, setDetailedSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrentSubscription = useCallback(async () => {
    try {
      const response = await getCurrentSubscription();
      if (response.success && response.data) {
        setDetailedSubscription(response.data);
      }
    } catch (error) {
      // Silent error handling
    }

    try {
      const billingResponse = await getBillingHistory();
      if (billingResponse.success && billingResponse.data) {
        setBillingHistory(billingResponse.data);
      }
    } catch (error) {
      // Silent error handling
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.LOGIN);
      return;
    }

    fetchCurrentSubscription();
    setLoading(false);
  }, [navigate, fetchCurrentSubscription]);

  return {
    detailedSubscription,
    billingHistory,
    loading,
    refreshSubscription: fetchCurrentSubscription,
  };
};
