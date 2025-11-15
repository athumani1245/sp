import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button } from 'react-bootstrap';
import Layout from "../components/Layout";
import AddTenantModal from "../components/forms/AddTenant";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import CardSkeleton from "../components/skeletons/CardSkeleton";
import { getTenants, deleteTenant, updateTenant } from "../services/tenantService";
import { useSubscription } from '../hooks/useSubscription';
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";
import "../assets/styles/tenants.css";

function Tenants() {
  const { hasActiveSubscription } = useSubscription();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pagination, setPagination] = useState({});
  
  // Modal states for adding tenant
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Inline editing states
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editTenantData, setEditTenantData] = useState({
    first_name: '',
    last_name: '',
    username: ''
  });
  const [updatingTenant, setUpdatingTenant] = useState(false);
  
  // Modal states for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [deletingTenant, setDeletingTenant] = useState(false);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // Prepare parameters for the API call
      const params = {
        page: page,
        limit: 10 // Number of tenants per page
      };
      
      if (search) {
        params.search = search;
      }
      
      if (status) {
        params.status = status;
      }
      
      // Call the tenant service
      const result = await getTenants(params);
      
      if (result.success) {
        setTenants(result.data?.items || []);
        setPagination({
          current_page: result.data?.current_page || 1,
          total_pages: result.data?.total_pages || 1,
          count: result.data?.count || 0,
          next: result.data?.next,
          previous: result.data?.previous
        });
      } else {
        console.error('Failed to fetch tenants:', result.error);
        setError(result.error || "Failed to fetch tenants");
        setTenants([]);
      }
      
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      setError("Failed to fetch tenants");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants, search, status, page]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    // Basic phone number formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "badge bg-success",
      inactive: "badge bg-secondary",
      pending: "badge bg-warning text-dark",
      blacklisted: "badge bg-danger",
    };
    return statusClasses[status?.toLowerCase()] || "badge bg-secondary";
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

  // Removed handleRowClick as we're doing inline editing only

  const handleEditTenant = (e, tenant) => {
    e.stopPropagation(); // Prevent row click
    setEditingTenantId(tenant.id);
    setEditTenantData({
      first_name: tenant.first_name || '',
      last_name: tenant.last_name || '',
      username: tenant.username || ''
    });
    setError('');
  };

  const handleEditTenantChange = (e) => {
    const { name, value } = e.target;
    setEditTenantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEditTenant = async () => {
    if (!editTenantData.first_name.trim() || !editTenantData.last_name.trim() || !editTenantData.username.trim()) {
      setError('All fields are required');
      return;
    }

    setUpdatingTenant(true);
    setError('');

    try {
      const result = await updateTenant(editingTenantId, editTenantData);
      
      if (result.success) {
        setTenants(prev => prev.map(tenant => 
          tenant.id === editingTenantId 
            ? { ...tenant, ...result.data }
            : tenant
        ));
        
        setEditingTenantId(null);
        setEditTenantData({
          first_name: '',
          last_name: '',
          username: ''
        });
        setSuccess('Tenant updated successfully!');
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update tenant');
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError('Failed to update tenant');
    } finally {
      setUpdatingTenant(false);
    }
  };

  const handleCancelEditTenant = () => {
    setEditingTenantId(null);
    setEditTenantData({
      first_name: '',
      last_name: '',
      username: ''
    });
    setError('');
  };

  const handleEditTenantKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEditTenant();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditTenant();
    }
  };

  const handleDeleteTenant = (e, tenant) => {
    e.stopPropagation(); // Prevent row click
    setTenantToDelete(tenant);
    setShowDeleteModal(true);
  };

  const confirmDeleteTenant = async () => {
    if (!tenantToDelete) return;
    
    setDeletingTenant(true);
    try {
      const result = await deleteTenant(tenantToDelete.id);
      if (result.success) {
        setTenants(prev => prev.filter(tenant => tenant.id !== tenantToDelete.id));
        setShowDeleteModal(false);
        setTenantToDelete(null);
        setSuccess(result.message || 'Tenant deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setError('Failed to delete tenant');
    } finally {
      setDeletingTenant(false);
    }
  };

  const cancelDeleteTenant = () => {
    setShowDeleteModal(false);
    setTenantToDelete(null);
  };

  const handleTenantAdded = (newTenant) => {
    console.log('New tenant added:', newTenant);
    setShowAddModal(false);
    // Refresh the tenant list to get the latest data from the server
    fetchTenants();
  };


  return (
    <Layout>
      <div className="main-content">
        {/* Filters Section */}
        <div className="tenants-filters-section">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <div className="flex-fill">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  id="tenant-search"
                  className="form-control"
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <select
                className="form-select"
                value={status}
                onChange={handleStatusFilter}
                style={{ minWidth: '150px' }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div className="flex-shrink-0">
              <button 
                className="odoo-btn odoo-btn-primary"
                onClick={() => setShowAddModal(true)}
                disabled={!hasActiveSubscription}
                style={{ minWidth: '160px' }}
                title={!hasActiveSubscription ? 'Subscription expired. Please renew to add tenants.' : ''}
              >
                <i className="bi bi-person-plus me-2"></i>
                Add New Tenant
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
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Tenants Section */}
        <div className="tenants-full-width">
          <div className="tenants-header-section">
            <h5 className="tenants-title">
              <i className="bi bi-people me-2"></i>
              Tenants
              {(tenants.length > 0 || pagination.count > 0) && (
                <span className="badge bg-primary ms-2">{pagination.count || tenants.length}</span>
              )}
            </h5>
          </div>
          
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

          {!loading && tenants.length === 0 && !error && (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-muted mt-3 mb-3">No Tenants Found</h4>
              <p className="text-muted mb-4">
                {search || status
                  ? "No tenants match your current filters. Try adjusting your search criteria."
                  : "No tenants have been added yet. Start by adding your first tenant."}
              </p>
              {!search && !status && (
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
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '35%' }}>Tenant Name</th>
                      <th style={{ width: '25%' }}>Contact</th>
                      <th style={{ width: '25%' }}>Status</th>
                      <th style={{ width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(tenants) && tenants.map((tenant) => (
                      <tr
                        key={tenant.id || Math.random()}
                        className={`${editingTenantId === tenant.id ? "table-warning" : ""}`}
                      >
                        <td>
                          <div className="tenant-info">
                            {editingTenantId === tenant.id ? (
                              <div className="row g-2">
                                <div className="col-6">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="first_name"
                                    value={editTenantData.first_name}
                                    onChange={handleEditTenantChange}
                                    onKeyDown={handleEditTenantKeyPress}
                                    placeholder="First name"
                                    disabled={updatingTenant}
                                    autoFocus
                                  />
                                </div>
                                <div className="col-6">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="last_name"
                                    value={editTenantData.last_name}
                                    onChange={handleEditTenantChange}
                                    onKeyDown={handleEditTenantKeyPress}
                                    placeholder="Last name"
                                    disabled={updatingTenant}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="tenant-name fw-medium">
                                {getTenantName(tenant)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {editingTenantId === tenant.id ? (
                              <div>
                                <input
                                  type="text"
                                  className="form-control form-control-sm mb-2"
                                  name="username"
                                  value={editTenantData.username}
                                  onChange={handleEditTenantChange}
                                  onKeyDown={handleEditTenantKeyPress}
                                  placeholder="Phone number"
                                  disabled={updatingTenant}
                                />
                              </div>
                            ) : (
                              <span className="text-muted">
                                {formatPhone(tenant.username) || 'No phone'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={getStatusBadge(tenant.status || 'active')}>
                            {((tenant.status || 'active').charAt(0).toUpperCase() + (tenant.status || 'active').slice(1))}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {editingTenantId === tenant.id ? (
                              <>
                                <button
                                  className="odoo-btn odoo-btn-success odoo-btn-sm me-1"
                                  onClick={handleSaveEditTenant}
                                  disabled={updatingTenant}
                                  title="Press Enter to confirm"
                                >
                                  <i className="bi bi-check2"></i>
                                </button>
                                <button
                                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                                  onClick={handleCancelEditTenant}
                                  disabled={updatingTenant}
                                  title="Press Esc to cancel"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="odoo-btn odoo-btn-outline-primary odoo-btn-sm me-1"
                                  onClick={(e) => handleEditTenant(e, tenant)}
                                  title="Edit Tenant"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                                  onClick={(e) => handleDeleteTenant(e, tenant)}
                                  title="Delete Tenant"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Full-Width List View */}
              <div className="d-md-none">
                <div className="tenant-list-container">
                  {Array.isArray(tenants) && tenants.map((tenant) => (
                    <div
                      key={tenant.id || Math.random()}
                      className={`tenant-list-item ${editingTenantId === tenant.id ? "editing" : ""}`}
                    >
                      <div className="tenant-list-header">
                        <div className="tenant-name-mobile">
                          {editingTenantId === tenant.id ? (
                            <div className="row g-2">
                              <div className="col-6">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  name="first_name"
                                  value={editTenantData.first_name}
                                  onChange={handleEditTenantChange}
                                  placeholder="First name"
                                  disabled={updatingTenant}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  name="last_name"
                                  value={editTenantData.last_name}
                                  onChange={handleEditTenantChange}
                                  placeholder="Last name"
                                  disabled={updatingTenant}
                                />
                              </div>
                            </div>
                          ) : (
                            getTenantName(tenant)
                          )}
                        </div>
                        <span className={getStatusBadge(tenant.status || 'active')}>
                          {((tenant.status || 'active').charAt(0).toUpperCase() + (tenant.status || 'active').slice(1))}
                        </span>
                      </div>
                      
                      <div className="tenant-list-body">
                        <div className="tenant-list-row">
                          <div className="tenant-list-label">
                            <i className="bi bi-telephone me-1"></i>Phone
                          </div>
                          <div className="tenant-list-value">
                            {editingTenantId === tenant.id ? (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                name="username"
                                value={editTenantData.username}
                                onChange={handleEditTenantChange}
                                placeholder="Phone number"
                                disabled={updatingTenant}
                              />
                            ) : (
                              formatPhone(tenant.username) || 'No phone'
                            )}
                          </div>
                        </div>
                        
                        <div className="tenant-list-actions">
                          {editingTenantId === tenant.id ? (
                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={handleSaveEditTenant}
                                disabled={updatingTenant}
                              >
                                <i className="bi bi-check2 me-1"></i>Save
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={handleCancelEditTenant}
                                disabled={updatingTenant}
                              >
                                <i className="bi bi-x me-1"></i>Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={(e) => handleEditTenant(e, tenant)}
                              >
                                <i className="bi bi-pencil me-1"></i>Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => handleDeleteTenant(e, tenant)}
                              >
                                <i className="bi bi-trash me-1"></i>Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="tenants-pagination-section">
              <nav aria-label="Tenants pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={pagination.current_page <= 1}
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                  >
                    <i className="bi bi-chevron-left me-1"></i>
                    Previous
                  </button>

                  <div className="pagination-info">
                    <span className="text-muted">
                      Page {pagination.current_page} of {pagination.total_pages || 1}
                    </span>
                  </div>

                  <button
                    className="btn btn-outline-secondary"
                    disabled={pagination.current_page >= pagination.total_pages}
                    onClick={() => handlePageChange(pagination.current_page + 1)}
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
              <strong>Phone:</strong> {tenantToDelete.username || 'N/A'}<br />
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

      {/* Inline editing has replaced the modal */}
    </Layout>
  );
}

export default Tenants;
