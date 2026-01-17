/**
 * useSubscriptionData Hook
 * Manages subscription and billing history data
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parse } from 'date-fns';
import { getCurrentSubscription, getBillingHistory } from '../../../services/licenseService';
import { ROUTES } from '../../../config/constants';

/**
 * Transform API response to component-friendly format
 * @param {Object} apiData - Raw API response data
 * @returns {Object} Transformed subscription data
 */
const transformSubscriptionData = (apiData) => {
  if (!apiData) return null;

  // Parse dates in DD-MM-YYYY format
  const parseDate = (dateString) => {
    try {
      return parse(dateString, 'dd-MM-yyyy', new Date());
    } catch (error) {
      console.error('Date parsing error:', error);
      return new Date();
    }
  };

  const endDate = parseDate(apiData.end_date);
  const today = new Date();
  const daysLeft = Math.max(0, differenceInDays(endDate, today));

  return {
    package_name: apiData.package_details?.name || 'N/A',
    plan_name: apiData.plan?.name || 'N/A',
    days_left: daysLeft,
    start_date: apiData.start_date,
    end_date: apiData.end_date,
    max_units: apiData.package_details?.max_units || 0,
    is_active: apiData.is_active,
  };
};

export const useSubscriptionData = () => {
  const [detailedSubscription, setDetailedSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrentSubscription = useCallback(async () => {
    try {
      const response = await getCurrentSubscription();
      if (response.success && response.data) {
        const transformedData = transformSubscriptionData(response.data);
        setDetailedSubscription(transformedData);
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
