/**
 * Leases Page - Refactored Version
 * Uses feature-based structure with custom hooks and modular components
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AddLeaseModal from '../components/forms/AddLeaseModal';
import { TableSkeleton, CardSkeleton } from '../components/skeletons';
import { useSubscription } from '../hooks/useSubscription';
import { useModal } from '../shared/hooks';
import { useLeasesList } from '../features/leases/hooks/useLeasesList';
import LeaseFilters from '../features/leases/components/LeaseFilters';
import LeasesSummaryCards from '../features/leases/components/LeasesSummaryCards';
import LeasesTable from '../features/leases/components/LeasesTable';
import LeasesMobileList from '../features/leases/components/LeasesMobileList';
import { getAllLeases } from '../services/leaseService';
import '../assets/styles/leases.css';

function Leases() {
  const navigate = useNavigate();
  const { hasActiveSubscription } = useSubscription();
  
  // Use custom hooks for state management
  const {
    leases,
    loading,
    error,
    filters,
    handleFilterChange,
    handleClearFilters,
    pagination,
    handlePageChange,
    activeFilterCount,
    refreshLeases,
  } = useLeasesList();

  const { isOpen: showAddModal, openModal, closeModal } = useModal();
  
  // Local state for UI-specific features
  const [showFilters, setShowFilters] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    activeLeases: 0,
    outstandingPayments: 0,
  });
  const [totalsData, setTotalsData] = useState(null);

  // Fetch summary data
  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      const result = await getAllLeases();
      if (result.success) {
        const allLeases = result.data || [];
        const stats = calculateSummaryStats(allLeases);
        setSummaryStats(stats);
        setTotalsData(result.totals || null);
      }
    } catch (error) {
      console.error('Failed to fetch summary data:', error);
    }
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
      if (!lease.end_date) return false;
      
      const endDate = new Date(lease.end_date);
      if (isNaN(endDate.getTime())) return false;
      
      endDate.setHours(0, 0, 0, 0);
      const isExpiringSoon = endDate >= today && endDate <= thirtyDaysFromNow;
      const isActiveOrRelevant = lease.status === 'active';
      
      return isExpiringSoon && isActiveOrRelevant;
    }).length;

    return stats;
  };

  const handleLeaseClick = (leaseId) => {
    navigate(`/leases/${leaseId}`);
  };

  const handleLeaseAdded = () => {
    closeModal();
    refreshLeases();
    fetchSummaryData();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${numAmount.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "badge bg-success",
      draft: "badge bg-info",
      terminated: "badge bg-secondary",
      expired: "badge bg-warning",
    };
    return statusClasses[status] || "badge bg-secondary";
  };

  return (
    <Layout>
      <div className="main-content">
        {/* Odoo-Style Navigation Bar */}
        <div className="odoo-navigation-bar">
          <div className="odoo-nav-left">
            <button
              className="odoo-btn odoo-btn-primary create-lease-btn"
              onClick={openModal}
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
            <LeaseFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              activeFilterCount={activeFilterCount}
            />
          </div>

          <div className="odoo-nav-right">
            <span className="odoo-pagination-info">
              {pagination.count > 0 && leases.length > 0 && (
                <>
                  {((pagination.current_page - 1) * pagination.page_size) + 1}-
                  {((pagination.current_page - 1) * pagination.page_size) + leases.length} / {pagination.count}
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

        {/* Summary Cards */}
        {!loading && leases.length > 0 && (
          <LeasesSummaryCards
            totalsData={totalsData}
            summaryStats={summaryStats}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Content Area */}
        <div className="leases-full-width">
          {/* Loading State */}
          {loading && (
            <>
              <div className="d-none d-md-block">
                <TableSkeleton rows={6} columns={6} />
              </div>
              <div className="d-md-none">
                <CardSkeleton count={4} />
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && leases.length === 0 && !error && (
            <div className="text-center py-5">
              <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-muted mt-3 mb-3">No Leases Found</h4>
              <p className="text-muted mb-4">
                {filters.search || filters.status
                  ? "No leases match your current filters. Try adjusting your search criteria."
                  : "No lease agreements have been created yet. Start by creating your first lease."}
              </p>
              {!filters.search && !filters.status && (
                <button 
                  className="odoo-btn odoo-btn-primary odoo-btn-lg"
                  onClick={openModal}
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired. Please renew to create leases.' : ''}
                >
                  <i className="bi bi-plus me-2"></i>
                  Create First Lease
                </button>
              )}
            </div>
          )}

          {/* Leases List */}
          {!loading && leases.length > 0 && (
            <>
              <LeasesTable
                leases={leases}
                onLeaseClick={handleLeaseClick}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
              />

              <LeasesMobileList
                leases={leases}
                onLeaseClick={handleLeaseClick}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
              />
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
          onClose={closeModal}
          onLeaseAdded={handleLeaseAdded}
        />
      )}
    </Layout>
  );
}

export default Leases;
