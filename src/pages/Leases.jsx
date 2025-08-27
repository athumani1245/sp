import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AddLeaseModal from "../components/forms/addLease";
import { getLeases } from "../services/leaseService";
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";

function Leases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Prepare parameters for the API call
      const params = {
        page: page,
        limit: 10 // Number of leases per page
      };
      
      if (debouncedSearch) {
        params.search = debouncedSearch;
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
        setLeases(result.data?.items || []);
        setPagination({
          current_page: result.data?.current_page || 1,
          total_pages: result.data?.total_pages || 1,
          count: result.data?.count || 0,
          next: result.data?.next,
          previous: result.data?.previous
        });
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
    console.log('useEffect triggered with:', { debouncedSearch, status, page });
    fetchLeases();
  }, [debouncedSearch, status, page]);

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    setPage(1); // Reset to first page when searching
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
      draft: "badge bg-info",
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
    } else if (lease.unit?.unit_name) {
      return lease.unit.unit_name;
    } else if (lease.unit?.unit_number) {
      return `Unit ${lease.unit.unit_number}`;
    }
    return 'Unknown Unit';
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
        {/* Filters Section */}
        <div className="leases-filters-section">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <div className="flex-fill">
              <div className="input-group">
                <span className="input-group-text">
                  {loading && debouncedSearch !== search ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Searching...</span>
                    </div>
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by tenant, property, or unit..."
                  value={search}
                  onChange={handleSearch}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    title="Clear search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
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
                <option value="draft">Draft</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="flex-shrink-0">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ minWidth: '140px' }}
              >
                <i className="bi bi-plus me-2"></i>
                Add New Lease
              </button>
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

        {/* Main Leases Section */}
        <div className="leases-full-width">
          <div className="leases-header-section">
            <h5 className="leases-title">
              <i className="bi bi-file-earmark-text me-2"></i>
              Lease Agreements
              {(leases.length > 0 || pagination.count > 0) && (
                <span className="badge bg-primary ms-2">{pagination.count || leases.length}</span>
              )}
            </h5>
          </div>
          
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
            <>
              {/* Desktop Table View */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '20%' }}>Reference</th>
                      <th style={{ width: '20%' }}>Property & Unit</th>
                      <th style={{ width: '20%' }}>Lease Period</th>
                      <th style={{ width: '15%' }}>Total Amount</th>
                      <th style={{ width: '13%' }}>Paid Amount</th>
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

              {/* Mobile Full-Width List View */}
              <div className="d-md-none">
                <div className="lease-list-container">
                  {Array.isArray(leases) && leases.map((lease) => (
                    <div
                      key={lease.id || Math.random()}
                      className="lease-list-item"
                      onClick={() => handleRowClick(lease.id)}
                    >
                      <div className="lease-list-header">
                        <div className="lease-reference-mobile">
                          {lease.lease_number || 'No Reference'}
                        </div>
                        <span className={getStatusBadge(lease.status || 'unknown')}>
                          {((lease.status || 'unknown').charAt(0).toUpperCase() + (lease.status || 'unknown').slice(1))}
                        </span>
                      </div>
                      
                      <div className="lease-list-body">
                        <div className="lease-list-row">
                          <div className="lease-list-label">
                            <i className="bi bi-person me-1"></i>Tenant
                          </div>
                          <div className="lease-list-value">
                            {lease.tenant && (lease.tenant.first_name || lease.tenant.last_name) 
                              ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
                              : lease.tenant?.username || 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="lease-list-row">
                          <div className="lease-list-label">
                            <i className="bi bi-building me-1"></i>Property
                          </div>
                          <div className="lease-list-value">
                            {lease.property.property_name || "No Property"}
                          </div>
                        </div>
                        
                        <div className="lease-list-amounts">
                          <div className="amount-item-list">
                            <div className="amount-label-list">Total</div>
                            <div className="amount-value-list total-amount">
                              {formatCurrency(lease.total_amount || 0)}
                            </div>
                          </div>
                          <div className="amount-item-list">
                            <div className="amount-label-list">Paid</div>
                            <div className="amount-value-list paid-amount">
                              {formatCurrency(lease.amount_paid || 0)}
                            </div>
                          </div>
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
            <div className="leases-pagination-section">
              <nav aria-label="Leases pagination">
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
