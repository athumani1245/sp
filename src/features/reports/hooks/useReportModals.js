/**
 * useReportModals Hook
 * Manages modal states for different report types
 */

import { useState } from 'react';

export const useReportModals = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showPropertySummaryModal, setShowPropertySummaryModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showTenantPaymentHistoryModal, setShowTenantPaymentHistoryModal] = useState(false);

  const openReportModal = (report, format = 'pdf') => {
    setSelectedReport(report);
    setSelectedFormat(format);
    
    // Close all modals first
    closeAllModals();
    
    // Show appropriate modal based on report data source
    if (report.dataSource === 'leases' || ['lease_agreements', 'lease_expiry', 'lease_renewal_termination'].includes(report.id)) {
      setShowLeaseModal(true);
    } else if (report.id === 'property_summary') {
      setShowPropertySummaryModal(true);
    } else if (report.dataSource === 'properties' || ['units_availability', 'property_performance', 'occupancy_report'].includes(report.id)) {
      setShowPropertyModal(true);
    } else if (report.id === 'tenant_payment_history') {
      setShowTenantPaymentHistoryModal(true);
    } else if (report.dataSource === 'tenants' || ['tenant_directory', 'tenant_outstanding_balance'].includes(report.id)) {
      setShowTenantModal(true);
    } else {
      // Default to lease modal
      setShowLeaseModal(true);
    }
  };

  const closeAllModals = () => {
    setShowLeaseModal(false);
    setShowPropertyModal(false);
    setShowPropertySummaryModal(false);
    setShowTenantModal(false);
    setShowTenantPaymentHistoryModal(false);
  };

  return {
    selectedReport,
    selectedFormat,
    showLeaseModal,
    showPropertyModal,
    showPropertySummaryModal,
    showTenantModal,
    showTenantPaymentHistoryModal,
    openReportModal,
    closeLeaseModal: () => setShowLeaseModal(false),
    closePropertyModal: () => setShowPropertyModal(false),
    closePropertySummaryModal: () => setShowPropertySummaryModal(false),
    closeTenantModal: () => setShowTenantModal(false),
    closeTenantPaymentHistoryModal: () => setShowTenantPaymentHistoryModal(false),
    closeAllModals,
  };
};
