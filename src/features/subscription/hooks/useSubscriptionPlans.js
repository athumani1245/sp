/**
 * useSubscriptionPlans Hook
 * Manages subscription plans and package selection
 */

import { useState, useRef } from 'react';
import { getSubscriptionPlans } from '../../../services/licenseService';

export const useSubscriptionPlans = () => {
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState({});
  const plansRef = useRef(null);

  const fetchSubscriptionPlans = async () => {
    setPlansLoading(true);
    try {
      const response = await getSubscriptionPlans();

      if (response.success && response.data) {
        const transformedPlans = response.data.map(pkg => {
          const features = [];

          if (pkg.max_units) {
            features.push(`Up to ${pkg.max_units} units`);
          }
          if (pkg.max_property_managers) {
            features.push(`Up to ${pkg.max_property_managers} property managers`);
          }
          if (pkg.allow_sms_notifications) {
            features.push('SMS Notifications');
          }
          if (pkg.description) {
            features.push(pkg.description);
          }

          return {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price || 0,
            duration: pkg.duration_days ? `${pkg.duration_days} days` : 'month',
            max_units: pkg.max_units,
            features: features.length > 0 ? features : ['Contact us for details'],
            plans: pkg.plans || [],
            description: pkg.description
          };
        });

        setPlans(transformedPlans);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setPlansLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    setShowUpgradePlans(true);
    if (plans.length === 0) {
      fetchSubscriptionPlans();
    }
    setTimeout(() => {
      plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPlans({});
    if (pkg.plans && pkg.plans.length > 0) {
      setSelectedPackage(pkg);
      setShowPlansModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowPlansModal(false);
    setSelectedPackage(null);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlans(prev => ({
      ...prev,
      [selectedPackage.id]: plan
    }));
    handleCloseModal();
  };

  const handleCancelPlanSelection = (packageId) => {
    setSelectedPlans(prev => {
      const updated = { ...prev };
      delete updated[packageId];
      return updated;
    });
  };

  return {
    showUpgradePlans,
    plans,
    plansLoading,
    showPlansModal,
    selectedPackage,
    selectedPlans,
    plansRef,
    setShowUpgradePlans,
    handleUpgradeClick,
    handleSelectPackage,
    handleCloseModal,
    handleSelectPlan,
    handleCancelPlanSelection,
  };
};
