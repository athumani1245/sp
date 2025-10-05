import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AddLeaseModal from "../components/forms/addLease";
import { getLeases, getAllLeases } from "../services/leaseService";
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
  const [summaryStats, setSummaryStats] = useState({
    totalLeases: 0,
    activeLeases: 0,
    outstandingPayments: 0,
    expiringSoon: 0
  });
  const [allLeases, setAllLeases] = useState([]); // Store all leases for summary calculations

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch all leases for summary statistics (without pagination)
  const fetchAllLeasesForSummary = useCallback(async () => {
    try {
      // Use the dedicated getAllLeases function for summary statistics
      const result = await getAllLeases();
      
      if (result.success) {
        const allLeaseData = result.data?.items || result.data || [];
        setAllLeases(allLeaseData);
        setSummaryStats(calculateSummaryStats(allLeaseData));
        console.log(`Fetched ${allLeaseData.length} leases for summary statistics`);
      } else {
        console.error('Failed to fetch all leases for summary:', result.error);
        // Keep existing summary stats if fetch fails
      }
    } catch (error) {
      console.error("Failed to fetch all leases for summary:", error);
      // Keep existing summary stats if fetch fails
    }
  }, []);

    const fetchLeases = useCallback(async (pageNum = page, searchTerm = debouncedSearch, statusFilter = status) => {
    try {
      setLoading(true);
      setError("");
      
      // Prepare parameters for the API call
      const params = {
        page: pageNum,
        limit: 10 // Number of leases per page
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      // Call the actual lease service
      const result = await getLeases(params);      if (result.success) {
        const leaseData = result.data?.items || [];
        setLeases(leaseData);
        // Don't calculate summary stats from paginated data anymore
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
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  // Fetch all leases for summary on component mount and when leases are added
  useEffect(() => {
    fetchAllLeasesForSummary();
  }, []); // Only run once on mount

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

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${numAmount.toLocaleString()}`;
  };

  // Calculate summary statistics
  const calculateSummaryStats = (leaseData) => {
    const stats = {
      totalLeases: leaseData.length,
      activeLeases: leaseData.filter(lease => lease.status === 'active').length,
      outstandingPayments: 0,
      expiringSoon: 0
    };

    // Calculate outstanding payments (total amount - paid amount)
    stats.outstandingPayments = leaseData.reduce((sum, lease) => {
      const totalAmount = Number(lease.total_amount) || 0;
      const paidAmount = Number(lease.amount_paid) || 0;
      const outstanding = totalAmount - paidAmount;
      return sum + (outstanding > 0 ? outstanding : 0);
    }, 0);

    // Calculate expiring soon (within 30 days) - fixed logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999); // End of that day

    console.log('Calculating expiring leases:');
    console.log('Today:', today.toISOString());
    console.log('30 days from now:', thirtyDaysFromNow.toISOString());

    stats.expiringSoon = leaseData.filter(lease => {
      // Only check leases that have an end date
      if (!lease.end_date) {
        console.log(`Lease ${lease.lease_number || lease.id}: No end date`);
        return false;
      }
      
      // Parse the end date - handle both YYYY-MM-DD and other formats
      const endDate = new Date(lease.end_date);
      
      // Check if date is valid
      if (isNaN(endDate.getTime())) {
        console.log(`Lease ${lease.lease_number || lease.id}: Invalid end date ${lease.end_date}`);
        return false;
      }
      
      // Set to start of day for the lease end date for consistent comparison
      endDate.setHours(0, 0, 0, 0);
      
      // Check if lease expires within the next 30 days (including today)
      // The lease is expiring soon if its end date is between today and 30 days from now
      const isExpiringSoon = endDate >= today && endDate <= thirtyDaysFromNow;
      
      // Only consider active leases for expiring soon (not terminated or draft)
      const isActiveOrRelevant = lease.status === 'active';
      
      const shouldCount = isExpiringSoon && isActiveOrRelevant;
      
      console.log(`Lease ${lease.lease_number || lease.id}:`, {
        endDate: lease.end_date,
        parsedEndDate: endDate.toISOString(),
        status: lease.status,
        isExpiringSoon,
        isActiveOrRelevant,
        shouldCount
      });
      
      return shouldCount;
    }).length;

    console.log(`Total expiring soon: ${stats.expiringSoon}`);

    return stats;
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
    setShowAddModal(false);
    // Refresh both the paginated lease list and summary statistics
    fetchLeases();
    fetchAllLeasesForSummary();
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
                    className="odoo-btn odoo-btn-secondary"
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
                className="odoo-btn odoo-btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ minWidth: '140px' }}
              >
                <i className="bi bi-plus me-2"></i>
                Add New Lease
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && leases.length > 0 && (
          <div className="summary-cards-section mb-4">
            <div className="row g-3">
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-file-earmark-text text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Total Leases</h6>
                    </div>
                    <h4 className="text-primary mb-0 fs-4">{summaryStats.totalLeases}</h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-check-circle text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Active Leases</h6>
                    </div>
                    <h4 className="text-success mb-0 fs-4">{summaryStats.activeLeases}</h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-credit-card-2-back text-danger me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Outstanding</h6>
                    </div>
                    <h4 className="text-danger mb-0 fs-6">
                      TSh {summaryStats.outstandingPayments.toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-exclamation-triangle text-warning me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Expiring Soon</h6>
                    </div>
                    <h4 className="text-warning mb-0 fs-4">{summaryStats.expiringSoon}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
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
                  className="odoo-btn odoo-btn-primary odoo-btn-lg"
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
                              {lease.start_date}
                            </span>
                            <span className="lease-duration">
                              to {lease.end_date}
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
                    className="odoo-btn odoo-btn-secondary"
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
                    className="odoo-btn odoo-btn-secondary"
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
