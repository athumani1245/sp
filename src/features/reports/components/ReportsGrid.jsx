/**
 * ReportsGrid Component
 * Displays reports organized by category
 */

import React from 'react';
import PropTypes from 'prop-types';
import ReportCard from './ReportCard';

const ReportsGrid = ({ groupedReports, onGenerateReport, loading, selectedReport }) => {
  return (
    <div className="leases-filters-section reports-grid">
      {Object.entries(groupedReports).map(([category, reports]) => (
        <div key={category} className="mb-3">
          <h6 className="text-muted mb-2 fw-semibold">
            <i className="bi bi-folder me-2"></i>
            {category}
          </h6>
          <div className="row g-2">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onGenerate={onGenerateReport}
                isLoading={loading && selectedReport?.id === report.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

ReportsGrid.propTypes = {
  groupedReports: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
      })
    )
  ).isRequired,
  onGenerateReport: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedReport: PropTypes.shape({
    id: PropTypes.string,
  }),
};

export default ReportsGrid;
