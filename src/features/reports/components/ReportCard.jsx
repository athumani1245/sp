/**
 * ReportCard Component
 * Displays a single report card with preview action
 */

import React from 'react';
import PropTypes from 'prop-types';

const ReportCard = ({ report, onGenerate, isLoading }) => {
  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-6">
      <div className="report-card compact">
        <div className="report-card-header">
          <div className={`report-icon bg-${report.color}`}>
            <i className={`bi ${report.icon}`}></i>
          </div>
          <div className="report-info">
            <h6 className="report-title">{report.title}</h6>
            <small className="report-description">{report.description}</small>
          </div>
        </div>
        <div className="report-card-footer">
          <button
            className="odoo-btn odoo-btn-primary odoo-btn-sm w-100"
            onClick={() => onGenerate(report, 'preview')}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="bi bi-arrow-clockwise loading me-1"></i>
                <span className="d-none d-sm-inline">Loading...</span>
              </>
            ) : (
              <>
                <i className="bi bi-eye me-1"></i>
                <span className="d-none d-sm-inline">Preview</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ReportCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  onGenerate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default ReportCard;
