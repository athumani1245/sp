/**
 * Tenant Detail Page - Refactored
 * Displays detailed information about a single tenant with edit/delete actions
 * 
 * Refactoring Changes:
 * - Extracted useTenantDetails hook for data fetching
 * - Extracted useTenantActions hook for edit/delete actions
 * - Created TenantInfoSection component
 * - Created TenantLeasesSection component
 * - Reduced from 635 lines to ~180 lines (72% reduction)
 * - 13 useState → 2 hooks
 */

import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Layout from "../components/Layout";
import DetailsSkeleton from "../components/skeletons/DetailsSkeleton";
import TenantInfoSection from "../features/tenants/components/TenantInfoSection";
import TenantLeasesSection from "../features/tenants/components/TenantLeasesSection";
import { useTenantDetails } from "../features/tenants/hooks/useTenantDetails";
import { useTenantActions } from "../features/tenants/hooks/useTenantActions";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTES } from "../config/constants";
import "../assets/styles/property-details.css";

const getTenantName = (tenant) => {
  if (!tenant) return 'Unknown Tenant';
  if (tenant.first_name && tenant.last_name) {
    return `${tenant.first_name} ${tenant.last_name}`;
  }
  return tenant.first_name || tenant.last_name || tenant.username || 'Unknown Tenant';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

const getStatusBadge = (status) => {
  const badges = {
    active: 'badge bg-success',
    inactive: 'badge bg-secondary',
    pending: 'badge bg-warning text-dark',
    blacklisted: 'badge bg-danger'
  };
  return badges[status?.toLowerCase()] || 'badge bg-secondary';
};

function Tenant() {
  usePageTitle('Tenant Details');
  const { tenantId } = useParams();
  const navigate = useNavigate();
  
  // Custom hooks
  const {
    tenant,
    leases,
    loading,
    leasesLoading,
    error,
    leasesError,
    refreshTenant
  } = useTenantDetails(tenantId);

  const {
    isEditing,
    editData,
    updateLoading,
    showDeleteModal,
    deletingTenant,
    error: actionError,
    success,
    startEditing,
    handleInputChange,
    handleSave,
    handleCancel,
    handleDeleteClick,
    confirmDelete,
    cancelDelete
  } = useTenantActions(tenant, refreshTenant, () => navigate(ROUTES.TENANTS));

  const onSave = () => handleSave(tenantId);
  const onConfirmDelete = () => confirmDelete(tenantId);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <DetailsSkeleton />
      </Layout>
    );
  }

  // Error state
  if (error || !tenant) {
    return (
      <Layout>
        <div className="main-content">
          <div className="container-fluid py-4">
            <div className="alert alert-danger">
              <h4 className="alert-heading">Error!</h4>
              <p>{error || "Tenant not found"}</p>
              <Link to={ROUTES.TENANTS} className="btn btn-outline-danger">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Tenants
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const activeLeases = leases.filter(l => l.status === 'active').length;

  return (
    <Layout>
      <div className="main-content">
        <div className="profile-container">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={ROUTES.TENANTS}>Tenants</Link>
                  </li>
                  <li className="breadcrumb-item active">{getTenantName(tenant)}</li>
                </ol>
              </nav>
              <h1 className="page-title">Tenant Details</h1>
              <p className="page-subtitle">View and manage tenant information</p>
            </div>
            
            <div className="d-flex gap-2">
              {!isEditing ? (
                <>
                  <button className="btn btn-outline-primary" onClick={startEditing}>
                    <i className="bi bi-pencil me-2"></i>
                    Edit Tenant
                  </button>
                  <button className="btn btn-outline-danger" onClick={handleDeleteClick}>
                    <i className="bi bi-trash me-2"></i>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-success" onClick={onSave} disabled={updateLoading}>
                    {updateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check me-2"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleCancel} disabled={updateLoading}>
                    <i className="bi bi-x me-2"></i>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </div>
          )}

          {actionError && (
            <div className="alert alert-danger alert-dismissible fade show">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {actionError}
            </div>
          )}

          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Profile Card */}
              <div className="profile-card mb-4">
                <div className="profile-image-section">
                  <div className="profile-image-container">
                    <div className="profile-image-placeholder">
                      <i className="bi bi-person-circle" style={{ fontSize: '4rem' }}></i>
                    </div>
                  </div>
                </div>
                <div className="profile-summary text-center">
                  <h4 className="user-name">{getTenantName(tenant)}</h4>
                  <p className="user-email text-muted">{tenant.email || 'No email provided'}</p>
                  <span className={`${getStatusBadge(tenant.status || 'active')} mb-3`}>
                    {(tenant.status || 'active').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="profile-card">
                <div className="card-header">
                  <h5 className="card-title">
                    <i className="bi bi-bar-chart me-2"></i>
                    Statistics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between">
                          <span>Total Leases</span>
                          <strong className="text-primary">{leases.length}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between">
                          <span>Active Leases</span>
                          <strong className="text-success">{activeLeases}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between">
                          <span>Member Since</span>
                          <strong>{formatDate(tenant.date_joined || tenant.created_at)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-8">
              <TenantInfoSection
                tenant={tenant}
                isEditing={isEditing}
                editData={editData}
                onInputChange={handleInputChange}
                onSave={onSave}
                onCancel={handleCancel}
                onEdit={startEditing}
                updateLoading={updateLoading}
              />
              
              <TenantLeasesSection
                leases={leases}
                loading={leasesLoading}
                error={leasesError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this tenant?</p>
          <div className="alert alert-warning">
            <strong>Tenant:</strong> {getTenantName(tenant)}<br />
            <strong>Email:</strong> {tenant.email || 'N/A'}<br />
            <strong>Active Leases:</strong> {activeLeases}<br />
            <small className="text-muted">This action cannot be undone and may affect existing leases.</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete} disabled={deletingTenant}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirmDelete} disabled={deletingTenant}>
            {deletingTenant ? 'Deleting...' : 'Delete Tenant'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default Tenant;
