import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AddLeaseModal from "../components/forms/addLease";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import CardSkeleton from "../components/skeletons/CardSkeleton";
import { getLeases, getAllLeases } from "../services/leaseService";
import { getProperties } from "../services/propertyService";
import { getTenants } from "../services/tenantService";
import { useSubscription } from '../hooks/useSubscription';
import { usePageTitle } from "../hooks/usePageTitle";
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";

function Leases() {
  usePageTitle('Leases');
  const navigate = useNavigate();
  const { hasActiveSubscription } = useSubscription();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
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
  const [allLeases, setAllLeases] = useState([]);
  const [totalsData, setTotalsData] = useState(null);
  
  // Dropdown data for filters
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch all leases for summary statistics (without pagination)
  const fetchAllLeasesForSummary = useCallback(async () => {
    try {
      const result = await getAllLeases();
      
      if (result.success) {
        const allLeaseData = result.data?.items || result.data || [];
        setAllLeases(allLeaseData);
        
        // Check if API response includes totals data
        if (result.data?.totals) {
          setTotalsData(result.data.totals);
          setSummaryStats({
            totalLeases: result.data.totals.total_active_leases || 0,
            activeLeases: result.data.totals.total_active_leases || 0,
            outstandingPayments: result.data.totals.total_remaining_amount || 0,
            expiringSoon: 0 // This might need to be calculated separately if not in API
          });
        } else {
          // Fallback to manual calculation if totals not provided
          setSummaryStats(calculateSummaryStats(allLeaseData));
        }
        
      }
    } catch (error) {
    }
  }, []);

    const fetchLeases = useCallback(async (pageNum = page, searchTerm = debouncedSearch, statusFilter = status, property = propertyFilter, unit = unitFilter, tenant = tenantFilter) => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        page: pageNum,
        limit: 10
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      if (property) {
        params.property_id = property;
      }
      
      if (unit) {
        params.unit_id = unit;
      }
      
      if (tenant) {
        params.tenant_id = tenant;
      }
      
      const result = await getLeases(params);
      
      if (result.success) {
        const leaseData = result.data?.items || [];
        setLeases(leaseData);
        setPagination({
          current_page: result.data?.current_page || 1,
          total_pages: result.data?.total_pages || 1,
          count: result.data?.count || 0,
          next: result.data?.next,
          previous: result.data?.previous
        });
        
        // Update totals data if available in paginated response
        if (result.data?.totals) {
          setTotalsData(result.data.totals);
          setSummaryStats({
            totalLeases: result.data.totals.total_active_leases || 0,
            activeLeases: result.data.totals.total_active_leases || 0,
            outstandingPayments: result.data.totals.total_remaining_amount || 0,
            expiringSoon: 0 // This might need to be calculated separately if not in API
          });
        }
      } else {
        setError(result.error || "Failed to fetch leases");
        setLeases([]);
      }
      
    } catch (error) {
      setError("Failed to fetch leases");
      setLeases([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, propertyFilter, unitFilter, tenantFilter]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  useEffect(() => {
    fetchAllLeasesForSummary();
    fetchFilterData();
  }, []);

  // Fetch data for filter dropdowns
  const fetchFilterData = async () => {
    try {
      // Fetch all properties
      const propertiesResult = await getProperties({ limit: 1000 });
      if (propertiesResult.success) {
        setProperties(propertiesResult.data?.items || []);
      }

      // Fetch all tenants
      const tenantsResult = await getTenants({ limit: 1000 });
      if (tenantsResult.success) {
        setTenants(tenantsResult.data?.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    }
  };

  // Update units when property filter changes
  useEffect(() => {
    if (propertyFilter) {
      const selectedProperty = properties.find(p => p.id.toString() === propertyFilter);
      setUnits(selectedProperty?.units || []);
    } else {
      setUnits([]);
    }
  }, [propertyFilter, properties]);

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handlePropertyFilter = (value) => {
    setPropertyFilter(value);
    setUnitFilter(""); // Reset unit when property changes
    setPage(1);
  };

  const handleUnitFilter = (value) => {
    setUnitFilter(value);
    setPage(1);
  };

  const handleTenantFilter = (value) => {
    setTenantFilter(value);
    setPage(1);
  };

  const clearAllFilters = () => {
    setStatus("");
    setPropertyFilter("");
    setUnitFilter("");
    setTenantFilter("");
    setSearch("");
    setPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (status) count++;
    if (propertyFilter) count++;
    if (unitFilter) count++;
    if (tenantFilter) count++;
    return count;
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

  const calculateSummaryStats = (leaseData) => {
    const stats = {
      totalLeases: leaseData.length,
      activeLeases: leaseData.filter(lease => lease.status === 'active').length,
      outstandingPayments: 0,
      expiringSoon: 0
    };
    stats.outstandingPayments = leaseData.reduce((sum, lease) => {
      const totalAmount = Number(lease.total_amount) || 0;
      const paidAmount = Number(lease.amount_paid) || 0;
      const outstanding = totalAmount - paidAmount;
      return sum + (outstanding > 0 ? outstanding : 0);
    }, 0);

    // Calculate expiring soon (within 30 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);

    stats.expiringSoon = leaseData.filter(lease => {
      if (!lease.end_date) {
        return false;
      }
      
      const endDate = new Date(lease.end_date);
      
      if (isNaN(endDate.getTime())) {
        return false;
      }
      
      endDate.setHours(0, 0, 0, 0);
      
      const isExpiringSoon = endDate >= today && endDate <= thirtyDaysFromNow;
      const isActiveOrRelevant = lease.status === 'active';
      
      const shouldCount = isExpiringSoon && isActiveOrRelevant;
      
      return shouldCount;
    }).length;

    return stats;
  };

  const getUnitInfo = (lease) => {
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
    fetchLeases();
    fetchAllLeasesForSummary();
  };

  return (
    <Layout>
      <div className="main-content">
        {/* Odoo-Style Navigation Bar */}
        <div className="odoo-navigation-bar">
          <div className="odoo-nav-left">
            <button
              className="odoo-btn odoo-btn-primary create-lease-btn"
              onClick={() => setShowAddModal(true)}
              disabled={!hasActiveSubscription}
              type="button"
              title={!hasActiveSubscription ? 'Subscription expired. Please renew to add leases.' : ''}
            >
              New
            </button>
            <h5 className="odoo-page-title mb-0">
              <i className="bi bi-file-earmark-text me-2"></i>
              Leases
            </h5>
          </div>

          <div className="odoo-nav-center">
            <div className="odoo-search-bar">
              <button className="odoo-search-icon" type="button">
                <i className="bi bi-search"></i>
              </button>
              <button 
                className="odoo-filter-btn" 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                style={{ backgroundColor: getActiveFiltersCount() > 0 ? '#e0f2fe' : 'transparent' }}
              >
                <i className="bi bi-funnel"></i>
                {getActiveFiltersCount() > 0 && (
                  <span style={{ 
                    marginLeft: '4px', 
                    fontSize: '11px', 
                    backgroundColor: '#0369a1',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px'
                  }}>
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              {status && (
                <div className="odoo-active-filter">
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <button 
                    className="odoo-filter-remove"
                    onClick={() => setStatus("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
              {propertyFilter && (
                <div className="odoo-active-filter">
                  <span>{properties.find(p => p.id.toString() === propertyFilter)?.property_name || 'Property'}</span>
                  <button 
                    className="odoo-filter-remove"
                    onClick={() => handlePropertyFilter("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
              {tenantFilter && (
                <div className="odoo-active-filter">
                  <span>{tenants.find(t => t.id.toString() === tenantFilter)?.first_name || 'Tenant'}</span>
                  <button 
                    className="odoo-filter-remove"
                    onClick={() => handleTenantFilter("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
              <input
                type="text"
                className="odoo-search-input"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
              />
              <button className="odoo-dropdown-toggle" type="button">
                <i className="bi bi-chevron-down"></i>
              </button>
            </div>
          </div>

          <div className="odoo-nav-right">
            <span className="odoo-pagination-info">
              {pagination.count > 0 && leases.length > 0 && (
                <>
                  {((pagination.current_page - 1) * 10) + 1}-
                  {((pagination.current_page - 1) * 10) + leases.length} / {pagination.count}
                </>
              )}
            </span>
            <div className="odoo-pagination-controls">
              <button
                className="odoo-nav-arrow"
                disabled={pagination.current_page <= 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="odoo-nav-arrow"
                disabled={pagination.current_page >= pagination.total_pages}
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Dropdown */}
        {showFilters && (
          <div className="odoo-filters-panel">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select form-select-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Property</label>
                <select
                  className="form-select form-select-sm"
                  value={propertyFilter}
                  onChange={(e) => handlePropertyFilter(e.target.value)}
                >
                  <option value="">All Properties</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.property_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Unit</label>
                <select
                  className="form-select form-select-sm"
                  value={unitFilter}
                  onChange={(e) => handleUnitFilter(e.target.value)}
                  disabled={!propertyFilter || units.length === 0}
                >
                  <option value="">All Units</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_name || `Unit ${unit.unit_number}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Tenant</label>
                <select
                  className="form-select form-select-sm"
                  value={tenantFilter}
                  onChange={(e) => handleTenantFilter(e.target.value)}
                >
                  <option value="">All Tenants</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {`${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || tenant.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button
                className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                onClick={clearAllFilters}
              >
                <i className="bi bi-x-circle me-1"></i>
                Clear All
              </button>
              <button
                className="odoo-btn odoo-btn-primary odoo-btn-sm"
                onClick={() => setShowFilters(false)}
              >
                <i className="bi bi-check2 me-1"></i>
                Apply
              </button>
            </div>
          </div>
        )}


        {!loading && leases.length > 0 && (
          <div className="summary-cards-section mb-4">
            <div className="row g-3">
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-check-circle text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Active Leases</h6>
                    </div>
                    <h4 className="text-success mb-0 fs-4">
                      {totalsData ? totalsData.total_active_leases || 0 : summaryStats.activeLeases}
                    </h4>
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
                      TSh {totalsData ? (totalsData.total_remaining_amount || 0).toLocaleString() : summaryStats.outstandingPayments.toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-currency-dollar text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Total Paid</h6>
                    </div>
                    <h4 className="text-success mb-0 fs-6">
                      TSh {totalsData ? (totalsData.total_amount_paid || 0).toLocaleString() : 0}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <i className="bi bi-plus-circle text-info me-2" style={{ fontSize: '1.5rem' }}></i>
                      <h6 className="card-title mb-0 small">Over Paid</h6>
                    </div>
                    <h4 className="text-info mb-0 fs-6">
                      TSh {totalsData ? (totalsData.total_over_paid || 0).toLocaleString() : 0}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
          </div>
        )}


        <div className="leases-full-width">
          {loading && (
            <>
              {/* Desktop Table Skeleton */}
              <div className="d-none d-md-block">
                <TableSkeleton rows={6} columns={6} />
              </div>
              {/* Mobile Card Skeleton */}
              <div className="d-md-none">
                <CardSkeleton count={4} />
              </div>
            </>
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
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired. Please renew to create leases.' : ''}
                >
                  <i className="bi bi-plus me-2"></i>
                  Create First Lease
                </button>
              )}
            </div>
          )}

          {!loading && leases.length > 0 && (
            <>

              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0 leases-table">
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
