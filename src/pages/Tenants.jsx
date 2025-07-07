import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import Layout from "../components/Layout";
import { getTenants, deleteTenant } from "../services/tenantService";
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";

function Tenants() {
  const navigate = useNavigate();
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
  
  // Modal states for editing tenant
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  
  // Modal states for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [deletingTenant, setDeletingTenant] = useState(false);

  const fetchTenants = async () => {
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
      
      console.log('Fetching tenants with params:', params);
      
      // Call the tenant service
      const result = await getTenants(params);
      
      console.log('Tenant service result:', result);
      
      if (result.success) {
        console.log('Tenants data:', result.data);
        setTenants(result.data || []);
        setPagination(result.pagination || {});
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
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { search, status, page });
    fetchTenants();
  }, [search, status, page]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
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

  const handleRowClick = (tenantId) => {
    navigate(`/dashboard/tenants/${tenantId}`);
  };

  const handleEditTenant = (e, tenant) => {
    e.stopPropagation(); // Prevent row click
    setEditingTenant(tenant);
    setShowEditModal(true);
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

  const handleTenantUpdated = (updatedTenant) => {
    console.log('Tenant updated:', updatedTenant);
    setShowEditModal(false);
    setEditingTenant(null);
    // Refresh the tenant list to get the latest data from the server
    fetchTenants();
  };

  return (
    <Layout>
      <div className="main-content">
        {/* Profile-style Header */}
        <div className="profile-container">
          <div className="profile-header text-center">
            <h1 className="page-title">Tenant Management</h1>
            <p className="page-subtitle">Manage and track all tenant information</p>
          </div>

          {/* Action Button Section */}
          <div className="d-flex justify-content-end mb-4">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-person-plus me-2"></i>
              Add New Tenant
            </button>
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

          {/* Filters Card */}
          <div className="profile-card mb-4">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-funnel me-2"></i>
                Search & Filter
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Search Tenants</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, phone, or ID number..."
                      value={search}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status Filter</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={handleStatusFilter}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="blacklisted">Blacklisted</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button
                    className="btn btn-outline-secondary w-100 d-block"
                    onClick={() => {
                      setSearch("");
                      setStatus("");
                      setPage(1);
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {error}
              <details className="mt-2">
                <summary>Debug Info</summary>
                <small>
                  <div>API Base: {process.env.REACT_APP_API_BASE || 'Not configured'}</div>
                  <div>Current Page: {page}</div>
                  <div>Search: {search || 'None'}</div>
                  <div>Status Filter: {status || 'None'}</div>
                </small>
              </details>
            </div>
          )}

          {/* Main Tenants Card */}
          <div className="profile-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-people me-2"></i>
                Tenants
                {tenants.length > 0 && (
                  <span className="badge bg-primary ms-2">{tenants.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading tenants...</p>
                </div>
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
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="bi bi-person-plus me-2"></i>{' '}
                      Add First Tenant
                    </button>
                  )}
                </div>
              )}

              {!loading && tenants.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '25%' }}>Tenant Name</th>
                        <th style={{ width: '20%' }}>Contact Info</th>
                        <th style={{ width: '15%' }}>Join Date</th>
                        <th style={{ width: '12%' }}>Status</th>
                        <th style={{ width: '13%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(tenants) && tenants.map((tenant) => (
                        <tr
                          key={tenant.id || Math.random()}
                          onClick={() => handleRowClick(tenant.id)}
                          style={{ cursor: "pointer" }}
                          className="table-row-hover"
                        >
                          <td>
                            <div className="tenant-info">
                              <span className="tenant-name fw-medium">
                                {getTenantName(tenant)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <span className="email d-block">
                                <i className="bi bi-envelope me-1"></i>
                                {tenant.email || 'No email'}
                              </span>
                              <span className="phone text-muted">
                                <i className="bi bi-telephone me-1"></i>
                                {formatPhone(tenant.username) || 'No phone'}
                              </span>
                            </div>
                          </td>
                          
                          <td>
                            <span className="join-date">
                              {formatDate(tenant.date_joined || tenant.created_at)}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadge(tenant.status || 'active')}>
                              {((tenant.status || 'active').charAt(0).toUpperCase() + (tenant.status || 'active').slice(1))}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={(e) => handleEditTenant(e, tenant)}
                                title="Edit Tenant"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => handleDeleteTenant(e, tenant)}
                                title="Delete Tenant"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="card-footer">
                <nav aria-label="Tenants pagination">
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${pagination.current_page <= 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(pagination.total_pages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${pagination.current_page === pageNum ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}

                    <li className={`page-item ${pagination.current_page >= pagination.total_pages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.total_pages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
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
              <strong>Email:</strong> {tenantToDelete.email || 'N/A'}<br />
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

      {/* TODO: Add Tenant Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Tenant</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Add Tenant form will be implemented here.</p>
                {/* TODO: Create AddTenantModal component */}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Edit Tenant Modal */}
      {showEditModal && editingTenant && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Tenant</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTenant(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Edit Tenant form will be implemented here.</p>
                <p><strong>Editing:</strong> {getTenantName(editingTenant)}</p>
                {/* TODO: Create EditTenantModal component */}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTenant(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Tenants;
