import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import AddLeaseModal from "../components/forms/addLease";
import { getLeases } from "../services/leaseService";
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";

function Leases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Prepare parameters for the API call
      const params = {
        page: page,
        limit: 10 // Number of leases per page
      };
      
      if (search) {
        params.search = search;
      }
      
      if (status) {
        params.status = status;
      }
      
      console.log('Fetching leases with params:', params);
      
      // Call the actual lease service
      const result = await getLeases(params);
      
      console.log('Lease service result:', result);
      
      if (result.success) {
        console.log('Leases data:', result.data);
        setLeases(result.data || []);
        setPagination(result.pagination || {});
      } else {
        console.error('Failed to fetch leases:', result.error);
        setError(result.error || "Failed to fetch leases");
        setLeases([]);
      }
      
    } catch (error) {
      console.error("Failed to fetch leases:", error);
      setError("Failed to fetch leases");
      setLeases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { search, status, page });
    fetchLeases();
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "badge bg-success",
      pending: "badge bg-warning text-dark",
      expired: "badge bg-danger",
      terminated: "badge bg-secondary",
    };
    return statusClasses[status] || "badge bg-secondary";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${numAmount.toLocaleString()}`;
  };



  const getUnitInfo = (lease) => {
    // Handle different possible field names for unit information
    if (lease.unit_number) {
      return `Unit ${lease.unit_number}`;
    } else if (lease.unit_name) {
      return lease.unit_name;
    } else if (lease.unit && lease.unit.unit_name) {
      return lease.unit.unit_name;
    } else if (lease.unit && lease.unit.unit_number) {
      return `Unit ${lease.unit.unit_number}`;
    }
    return 'Unknown Unit';
  };

  const getPropertyName = (lease) => {
    // Handle different possible field names for property information
    if (lease.property_name) {
      return lease.property_name;
    } else if (lease.property && lease.property.property_name) {
      return lease.property.property_name;
    }
    return 'Unknown Property';
  };

  const handleRowClick = (leaseId) => {
    navigate(`/leases/${leaseId}`);
  };

  const handleLeaseAdded = (newLease) => {
    console.log('New lease added:', newLease);
    setShowAddModal(false);
    // Refresh the lease list to get the latest data from the server
    fetchLeases();
  };

  return (
    <Layout>
      <div className="main-content">
        {/* Profile-style Header */}
        <div className="profile-container">
          

          {/* Action Button Section */}
          <div className="d-flex justify-content-start mb-4">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus me-2"></i>
              Add New Lease
            </button>
          </div>

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
                  <label className="form-label">Search Leases</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by tenant, property, or unit..."
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
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="terminated">Terminated</option>
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

          {/* Main Leases Card */}
          <div className="profile-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-text me-2"></i>
                Lease Agreements
                {leases.length > 0 && (
                  <span className="badge bg-primary ms-2">{leases.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading leases...</p>
                </div>
              )}

              {!loading && leases.length === 0 && !error && (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: "4rem" }}></i>
                  <h4 className="text-muted mt-3 mb-3">No Leases Found</h4>
                  <p className="text-muted mb-4">
                    {search || status
                      ? "No leases match your current filters. Try adjusting your search criteria."
                      : "No lease agreements have been created yet. Start by creating your first lease."}
                  </p>
                  {!search && !status && (
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="bi bi-plus me-2"></i>
                      Create First Lease
                    </button>
                  )}
                </div>
              )}

              {!loading && leases.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '20%' }}>Reference</th>
                        <th style={{ width: '20%' }}>Property & Unit</th>
                        <th style={{ width: '20%' }}>Lease Period</th>
                        <th style={{ width: '15%' }}>Amount</th>
                        <th style={{ width: '13%' }}>Paid</th>
                        <th style={{ width: '12%' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(leases) && leases.map((lease) => (
                        <tr
                          key={lease.id || Math.random()}
                          onClick={() => handleRowClick(lease.id)}
                          style={{ cursor: "pointer" }}
                          className="table-row-hover"
                        >
                          <td>
                            <div className="tenant-info">
                              <span className="tenant-name">
                                {lease.lease_number || 'No Reference'}
                              </span>
                              <span className="tenant-email">
                                {lease.tenant && (lease.tenant.first_name || lease.tenant.last_name) 
                                  ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
                                  : lease.tenant?.username || 'Unknown Tenant'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="property-info">
                              <span className="property-name">
                                {lease.property.property_name || "No Property"}
                              </span>
                              <span className="unit-number">
                                {getUnitInfo(lease)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="lease-period">
                              <span className="lease-dates">
                                {formatDate(lease.start_date)}
                              </span>
                              <span className="lease-duration">
                                to {formatDate(lease.end_date)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="rent-amount">
                              {formatCurrency(lease.total_amount || 0)}
                            </span>
                          </td>
                          <td>
                            <span className="paid-amount">
                              {formatCurrency(lease.amount_paid || 0)}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadge(lease.status || 'unknown')}>
                              {((lease.status || 'unknown').charAt(0).toUpperCase() + (lease.status || 'unknown').slice(1))}
                            </span>
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
                <nav aria-label="Leases pagination">
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

      {/* Add Lease Modal */}
      {showAddModal && (
        <AddLeaseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onLeaseAdded={handleLeaseAdded}
        />
      )}
    </Layout>
  );
}

export default Leases;
