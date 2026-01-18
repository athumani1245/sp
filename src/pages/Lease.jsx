/**
 * Lease Detail Page - Refactored
 * Displays detailed information about a single lease with actions
 * 
 * Refactoring Changes:
 * - Extracted useLeaseDetails hook for data fetching
 * - Extracted useLeaseActions hook for cancel/renew actions
 * - Created LeaseStatusBar component
 * - Created LeaseDetailsTab component
 * - Created LeaseActionButtons component
 * - Created CancelLeaseModal component
 * - Reduced from 766 lines to ~200 lines (74% reduction)
 * - 12 useState → 2 hooks + 2 local states
 */

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Payments from "../components/snippets/Payments";
import Toast from "../components/Toast";
import DetailsSkeleton from "../components/skeletons/DetailsSkeleton";
import RenewLeaseModal from "../components/forms/RenewLeaseModal";
import LeaseStatusBar from "../features/leases/components/LeaseStatusBar";
import LeaseDetailsTab from "../features/leases/components/LeaseDetailsTab";
import LeaseActionButtons from "../features/leases/components/LeaseActionButtons";
import CancelLeaseModal from "../features/leases/components/CancelLeaseModal";
import { useLeaseDetails } from "../features/leases/hooks/useLeaseDetails";
import { useLeaseActions } from "../features/leases/hooks/useLeaseActions";
import { generateLeaseAgreementPDF } from "../reports";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTES } from "../config/constants";
import "../assets/styles/leases.css";

function Lease() {
  usePageTitle('Lease Details');
  const { leaseId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("details");
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});

  // Custom hooks
  const { lease, loading, error, refreshLease } = useLeaseDetails(leaseId);
  const {
    isCancelling,
    showCancelConfirmation,
    showRenewModal,
    isGeneratingPDF,
    error: actionError,
    setIsGeneratingPDF,
    handleCancelClick,
    handleCancelConfirm,
    handleCancelModalClose,
    handleRenewClick,
    handleRenewModalClose,
  } = useLeaseActions(refreshLease);

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  const handlePreviewLeaseDocument = async () => {
    setIsGeneratingPDF(true);
    
    try {
      await generateLeaseAgreementPDF(lease, {
        download: false,
        preview: true,
        filename: `lease-agreement-${lease.lease_number}-${lease.tenant?.first_name || 'tenant'}-${lease.tenant?.last_name || ''}.pdf`
      });
      
      showToastMessage(
        'Success!', 
        'Lease agreement document preview opened in new tab. You can download it from there.',
        'success'
      );
    } catch (error) {
      showToastMessage(
        'Error',
        'Failed to generate lease document. Please try again.',
        'danger'
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRenewalSuccess = async () => {
    handleRenewModalClose();
    showToastMessage(
      'Lease Renewed Successfully',
      'The lease has been renewed with the new terms.',
      'success'
    );
    await refreshLease();
  };

  const handleConfirmCancel = async () => {
    const result = await handleCancelConfirm(leaseId);
    if (result.success) {
      showToastMessage('Success', 'Lease cancelled successfully', 'success');
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <DetailsSkeleton />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="main-content">
          <div className="leases-filters-section">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error</h4>
              <p>{error}</p>
              <hr />
              <button 
                className="btn btn-outline-danger"
                onClick={() => navigate(ROUTES.LEASES)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Leases
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not found state
  if (!lease) {
    return (
      <Layout>
        <div className="main-content">
          <div className="leases-filters-section">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">Lease Not Found</h4>
              <p>The requested lease could not be found.</p>
              <hr />
              <button 
                className="btn btn-outline-warning"
                onClick={() => navigate(ROUTES.LEASES)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Leases
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
          {/* Top Row: Breadcrumb/Title and Status */}
          <div className="row align-items-center mb-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <Link to={ROUTES.LEASES} className="text-decoration-none text-muted">
                  <i className="bi bi-arrow-left me-1"></i>
                  Leases
                </Link>
                <span className="text-muted">/</span>
                <h5 className="mb-0 fw-bold">{lease.lease_number}</h5>
              </div>
            </div>
            
            <div className="col-md-6">
              <LeaseStatusBar status={lease.status} />
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="d-none d-md-flex">
            <LeaseActionButtons
              lease={lease}
              isGeneratingPDF={isGeneratingPDF}
              isCancelling={isCancelling}
              onPreviewDocument={handlePreviewLeaseDocument}
              onRenew={handleRenewClick}
              onCancel={handleCancelClick}
            />
          </div>

          {/* Action Buttons - Mobile */}
          <div className="d-md-none">
            <LeaseActionButtons
              lease={lease}
              isGeneratingPDF={isGeneratingPDF}
              isCancelling={isCancelling}
              onPreviewDocument={handlePreviewLeaseDocument}
              onRenew={handleRenewClick}
              onCancel={handleCancelClick}
              isMobile={true}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="leases-filters-section">
          <div className="lease-tabs-container">
            <button
              className={`lease-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => handleTabSelect('details')}
            >
              <i className="bi bi-info-circle me-1"></i>
              <span className="d-none d-md-inline">Details</span>
              <span className="d-md-none">Info</span>
            </button>
            <button
              className={`lease-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => handleTabSelect('payments')}
            >
              <i className="bi bi-credit-card me-1"></i>
              <span className="d-none d-md-inline">Payments</span>
              <span className="d-md-none">Payments</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="leases-filters-section">
          {activeTab === "details" && <LeaseDetailsTab lease={lease} />}
          
          {activeTab === "payments" && (
            <div className="payments-tab-content">
              <Payments 
                payments={lease.payments || []}
                leaseId={leaseId}
                refreshData={refreshLease}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CancelLeaseModal
        show={showCancelConfirmation}
        onHide={handleCancelModalClose}
        onConfirm={handleConfirmCancel}
        lease={lease}
        isCancelling={isCancelling}
        error={actionError}
      />

      <RenewLeaseModal
        show={showRenewModal}
        onHide={handleRenewModalClose}
        lease={lease}
        onRenewalSuccess={handleRenewalSuccess}
      />
    </Layout>
  );
}

export default Lease;
