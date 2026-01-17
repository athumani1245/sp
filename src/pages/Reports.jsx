/**
 * Reports Page - Refactored
 * Central hub for generating various reports and exports
 * 
 * Refactoring Changes:
 * - Extracted REPORT_TYPES to config/reportTypes.js (11 report definitions)
 * - Extracted useReportModals hook (8 modal states → 1 hook)
 * - Created ReportCard component for individual report cards
 * - Created ReportsGrid component for organized report display
 * - Created ReportsStats component for quick statistics
 * - Reduced from 636 lines to ~170 lines (73% reduction)
 * - Improved code organization and maintainability
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { usePageTitle } from "../hooks/usePageTitle";
import ReportsGrid from "../features/reports/components/ReportsGrid";
import ReportsStats from "../features/reports/components/ReportsStats";
import { useReportModals } from "../features/reports/hooks/useReportModals";
import { REPORT_TYPES, groupReportsByCategory } from "../config/reportTypes";
import {
  LeaseReportModal,
  PropertyReportModal,
  PropertySummaryReportModal,
  TenantReportModal,
  TenantPaymentHistoryModal
} from "./reports/index";
import "../assets/styles/reports.css";

function Reports() {
  usePageTitle('Reports');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const {
    selectedReport,
    selectedFormat,
    showLeaseModal,
    showPropertyModal,
    showPropertySummaryModal,
    showTenantModal,
    showTenantPaymentHistoryModal,
    openReportModal,
    closeLeaseModal,
    closePropertyModal,
    closePropertySummaryModal,
    closeTenantModal,
    closeTenantPaymentHistoryModal,
  } = useReportModals();

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  const handleGenerateReport = (report, format = 'pdf') => {
    openReportModal(report, format);
  };

  const groupedReports = groupReportsByCategory(REPORT_TYPES);

  return (
    <Layout>
      {/* Toast notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        title={toastConfig.title}
        message={toastConfig.message}
        variant={toastConfig.variant}
        autoHide={true}
        delay={4000}
      />

      <div className="main-content">
        {/* Header */}
        <div className="leases-filters-section">
          <div className="row g-3 align-items-center">
            <div className="col-8">
              <h4 className="mb-1">
                <i className="bi bi-file-earmark-text me-2"></i>
                <span className="d-none d-sm-inline">Reports & Exports</span>
                <span className="d-inline d-sm-none">Reports</span>
              </h4>
            </div>
            <div className="col-4">
              <div className="d-flex justify-content-end">
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  <span className="d-none d-md-inline">Back to </span>
                  <span className="d-none d-sm-inline d-md-none">Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <ReportsGrid
          groupedReports={groupedReports}
          onGenerateReport={handleGenerateReport}
          loading={loading}
          selectedReport={selectedReport}
        />

        {/* Quick Stats */}
        <ReportsStats totalReports={REPORT_TYPES.length} />
      </div>

      {/* Report Modals */}
      <LeaseReportModal
        show={showLeaseModal}
        onHide={closeLeaseModal}
        reportConfig={selectedReport}
        selectedFormat={selectedFormat}
      />

      <PropertyReportModal
        show={showPropertyModal}
        onHide={closePropertyModal}
        reportConfig={selectedReport}
        selectedFormat={selectedFormat}
      />

      <PropertySummaryReportModal
        show={showPropertySummaryModal}
        onHide={closePropertySummaryModal}
        reportConfig={selectedReport}
        dateFilter={dateFilter}
      />

      <TenantReportModal
        show={showTenantModal}
        onHide={closeTenantModal}
        reportConfig={selectedReport}
        selectedFormat={selectedFormat}
      />

      <TenantPaymentHistoryModal
        show={showTenantPaymentHistoryModal}
        onHide={closeTenantPaymentHistoryModal}
        reportConfig={selectedReport}
        dateFilter={dateFilter}
      />
    </Layout>
  );
}

export default Reports;
