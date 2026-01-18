/**
 * Tenants Page - Refactored
 * Manages tenant listing with search, inline editing, and deletion
 * 
 * Refactoring Changes:
 * - Extracted useTenantsList hook for data fetching (15 useState → 4 hooks)
 * - Extracted useTenantEdit hook for inline editing logic
 * - Extracted useTenantDelete hook for deletion with confirmation
 * - Created TenantsTable component for desktop view
 * - Created TenantsMobileList component for mobile view
 * - Created TenantRow component (shared by both views)
 * - Reduced from 710 lines to ~250 lines (65% reduction)
 */

import React, { useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import Layout from "../components/Layout";
import AddTenantModal from "../components/forms/AddTenant";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import CardSkeleton from "../components/skeletons/CardSkeleton";
import TenantsTable from "../features/tenants/components/TenantsTable";
import TenantsMobileList from "../features/tenants/components/TenantsMobileList";
import { useTenantsList } from "../features/tenants/hooks/useTenantsList";
import { useTenantEdit } from "../features/tenants/hooks/useTenantEdit";
import { useTenantDelete } from "../features/tenants/hooks/useTenantDelete";
import { useSubscription } from '../hooks/useSubscription';
import { usePageTitle } from "../hooks/usePageTitle";
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";
import "../assets/styles/tenants.css";

function Tenants() {
  usePageTitle('Tenants');
  const { hasActiveSubscription } = useSubscription();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Data fetching hook
  const {
    tenants,
    loading,
    error: fetchError,
    search,
    handleSearch,
    pagination,
    handlePageChange,
    refreshTenants,
    setTenants,
  } = useTenantsList();

  // Success/Error handlers
  const handleSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleError = (message) => {
    setError(message);
  };

  // Inline editing hook
  const {
    editingTenantId,
    editTenantData,
    updatingTenant,
    handleEditTenant,
    handleEditTenantChange,
    handleSaveEditTenant,
    handleCancelEditTenant,
  } = useTenantEdit(tenants, setTenants, handleSuccess, handleError);

  // Delete hook
  const {
    showDeleteModal,
    tenantToDelete,
    deletingTenant,
    handleDeleteTenant,
    confirmDeleteTenant,
    cancelDeleteTenant,
  } = useTenantDelete(setTenants, handleSuccess, handleError);

  const handleTenantAdded = () => {
    setShowAddModal(false);
    refreshTenants();
  };

  const getTenantName = (tenant) => {
    if (tenant.first_name && tenant.last_name) {
      return `${tenant.first_name} ${tenant.last_name}`;
    } else if (tenant.first_name) {
      return tenant.first_name;
    } else if (tenant.last_name) {
      return tenant.last_name;
    } else if (tenant.username) {
      return tenant.username;
    }
    return 'Unknown Tenant';
  };

  const displayError = error || fetchError;

  return (
    <Layout>
      <div className="main-content">
        {/* Odoo-Style Navigation Bar */}
        <div className="odoo-navigation-bar">
          <div className="odoo-nav-left">
            <button
              className="odoo-btn odoo-btn-primary add-tenant-btn"
              onClick={() => setShowAddModal(true)}
              disabled={!hasActiveSubscription}
              type="button"
              title={!hasActiveSubscription ? 'Subscription expired. Please renew to add tenants.' : ''}
            >
              New
            </button>
            <h5 className="odoo-page-title mb-0">
              <i className="bi bi-people me-2"></i>
              Tenants
            </h5>
          </div>

          <div className="odoo-nav-center">
            <div className="odoo-search-bar">
              <button className="odoo-search-icon" type="button">
                <i className="bi bi-search"></i>
              </button>
              <button className="odoo-filter-btn" type="button">
                <i className="bi bi-funnel"></i>
              </button>
              <input
                type="text"
                className="odoo-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="odoo-dropdown-toggle" type="button">
                <i className="bi bi-chevron-down"></i>
              </button>
            </div>
          </div>

          <div className="odoo-nav-right">
            <span className="odoo-pagination-info">
              {pagination.count > 0 && tenants.length > 0 && (
                <>
                  {((pagination.currentPage - 1) * pagination.pageSize) + 1}-
                  {((pagination.currentPage - 1) * pagination.pageSize) + tenants.length} / {pagination.count}
                </>
              )}
            </span>
            <div className="odoo-pagination-controls">
              <button
                className="odoo-nav-arrow"
                disabled={pagination.currentPage <= 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="odoo-nav-arrow"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            <strong>Success:</strong> {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess('')}
            ></button>
          </div>
        )}

        {/* Error Alert */}
        {displayError && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {displayError}
          </div>
        )}

        {/* Main Tenants Section */}
        <div className="tenants-full-width">
          {loading && (
            <>
              {/* Desktop Table Skeleton */}
              <div className="d-none d-md-block">
                <TableSkeleton rows={5} columns={5} />
              </div>
              {/* Mobile Card Skeleton */}
              <div className="d-md-none">
                <CardSkeleton count={4} />
              </div>
            </>
          )}

          {!loading && tenants.length === 0 && !displayError && (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-muted mt-3 mb-3">No Tenants Found</h4>
              <p className="text-muted mb-4">
                {search
                  ? "No tenants match your current search. Try adjusting your search criteria."
                  : "No tenants have been added yet. Start by adding your first tenant."}
              </p>
              {!search && (
                <button 
                  className="odoo-btn odoo-btn-primary odoo-btn-lg"
                  onClick={() => setShowAddModal(true)}
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired. Please renew to add tenants.' : ''}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Add First Tenant
                </button>
              )}
            </div>
          )}

          {!loading && tenants.length > 0 && (
            <>
              {/* Desktop Table View */}
              <TenantsTable
                tenants={tenants}
                editingTenantId={editingTenantId}
                editData={editTenantData}
                onEdit={handleEditTenant}
                onCancelEdit={handleCancelEditTenant}
                onEditChange={handleEditTenantChange}
                onSaveEdit={handleSaveEditTenant}
                onDelete={handleDeleteTenant}
                updatingTenant={updatingTenant}
                hasActiveSubscription={hasActiveSubscription}
              />

              {/* Mobile List View */}
              <TenantsMobileList
                tenants={tenants}
                editingTenantId={editingTenantId}
                editData={editTenantData}
                onEdit={handleEditTenant}
                onCancelEdit={handleCancelEditTenant}
                onEditChange={handleEditTenantChange}
                onSaveEdit={handleSaveEditTenant}
                onDelete={handleDeleteTenant}
                updatingTenant={updatingTenant}
                hasActiveSubscription={hasActiveSubscription}
              />
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="tenants-pagination-section">
              <nav aria-label="Tenants pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    <i className="bi bi-chevron-left me-1"></i>
                    Previous
                  </button>

                  <div className="pagination-info">
                    <span className="text-muted">
                      Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </span>
                  </div>

                  <button
                    className="btn btn-outline-secondary"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Next
                    <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDeleteTenant} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this tenant?</p>
          {tenantToDelete && (
            <div className="alert alert-warning">
              <strong>Tenant:</strong> {getTenantName(tenantToDelete)}<br />
              <strong>Username:</strong> {tenantToDelete.username || 'N/A'}<br />
              <small className="text-muted">This action cannot be undone and may affect existing leases.</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDeleteTenant} disabled={deletingTenant}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteTenant} 
            disabled={deletingTenant}
          >
            {deletingTenant ? 'Deleting...' : 'Delete Tenant'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTenantAdded={handleTenantAdded}
      />
    </Layout>
  );
}

export default Tenants;
