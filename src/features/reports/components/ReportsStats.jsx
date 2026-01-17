/**
 * ReportsStats Component
 * Displays quick stats about available reports
 */

import React from 'react';
import PropTypes from 'prop-types';

const ReportsStats = ({ totalReports }) => {
  return (
    <div className="leases-filters-section">
      <div className="row g-3">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-primary">
              <i className="bi bi-file-earmark-text"></i>
            </div>
            <div className="stat-info">
              <h6>Total Reports</h6>
              <span className="stat-number">{totalReports}</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-success">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-info">
              <h6>Available</h6>
              <span className="stat-number">{totalReports}</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-info">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stat-info">
              <h6>Real-time</h6>
              <span className="stat-number">100%</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-warning">
              <i className="bi bi-eye"></i>
            </div>
            <div className="stat-info">
              <h6>Preview Mode</h6>
              <span className="stat-number">Interactive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReportsStats.propTypes = {
  totalReports: PropTypes.number.isRequired,
};

export default ReportsStats;
