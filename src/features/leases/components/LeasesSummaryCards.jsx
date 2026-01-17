/**
 * LeasesSummaryCards Component
 * Displays summary statistics for leases
 */

import React from 'react';
import PropTypes from 'prop-types';

const LeasesSummaryCards = ({ totalsData, summaryStats }) => {
  const activeLeases = totalsData?.total_active_leases || summaryStats?.activeLeases || 0;
  const outstandingAmount = totalsData?.total_remaining_amount || summaryStats?.outstandingPayments || 0;
  const paidAmount = totalsData?.total_amount_paid || 0;
  const overPaidAmount = totalsData?.total_over_paid || 0;

  return (
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
                {activeLeases}
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
                TSh {outstandingAmount.toLocaleString()}
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
                TSh {paidAmount.toLocaleString()}
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
                TSh {overPaidAmount.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LeasesSummaryCards.propTypes = {
  totalsData: PropTypes.shape({
    total_active_leases: PropTypes.number,
    total_remaining_amount: PropTypes.number,
    total_amount_paid: PropTypes.number,
    total_over_paid: PropTypes.number,
  }),
  summaryStats: PropTypes.shape({
    activeLeases: PropTypes.number,
    outstandingPayments: PropTypes.number,
  }),
};

LeasesSummaryCards.defaultProps = {
  totalsData: null,
  summaryStats: null,
};

export default LeasesSummaryCards;
