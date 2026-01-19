/**
 * LeaseActionButtons Component
 * Action buttons for lease (download, renew, cancel)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LEASE_STATUS } from '../../../config/constants';

const LeaseActionButtons = ({
  lease,
  isGeneratingPDF,
  isCancelling,
  onPreviewDocument,
  onRenew,
  onCancel,
  isMobile = false
}) => {
  // Renew button should only appear for active (running) or expired leases
  const canRenew = lease.status === LEASE_STATUS.ACTIVE || lease.status === LEASE_STATUS.EXPIRED;
  const canCancel = ![LEASE_STATUS.CANCELLED, LEASE_STATUS.TERMINATED, LEASE_STATUS.EXPIRED].includes(lease.status);

  if (isMobile) {
    return (
      <div className="row g-2">
        <div className="col-12">
          <button
            className={`odoo-button odoo-primary w-100 ${isGeneratingPDF ? 'loading' : ''}`}
            onClick={onPreviewDocument}
            disabled={isGeneratingPDF}
            title="Download Lease Document"
          >
            {!isGeneratingPDF && (
              <>
                <i className="bi bi-file-earmark-text"></i>
                <i className="bi bi-download"></i>
              </>
            )}
            {isGeneratingPDF && 'Generating...'}
          </button>
        </div>
        
        {canRenew && (
          <div className="col-12">
            <button
              className="odoo-button odoo-success w-100"
              onClick={onRenew}
            >
              <i className="bi bi-arrow-repeat"></i>
              <span>Renew Lease</span>
            </button>
          </div>
        )}
        
        {canCancel && (
          <div className="col-12">
            <button
              className={`odoo-button odoo-danger w-100 ${isCancelling ? 'loading' : ''}`}
              onClick={onCancel}
              disabled={isCancelling}
            >
              {!isCancelling && <i className="bi bi-x-circle"></i>}
              {isCancelling ? 'Cancelling...' : 'Cancel Lease'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex gap-2 align-items-center">
      <button
        className={`odoo-button odoo-primary ${isGeneratingPDF ? 'loading' : ''}`}
        onClick={onPreviewDocument}
        disabled={isGeneratingPDF}
        title="Download Lease Document"
      >
        {!isGeneratingPDF && (
          <>
            <i className="bi bi-file-earmark-text"></i>
            <i className="bi bi-download"></i>
          </>
        )}
        {isGeneratingPDF && 'Generating...'}
      </button>

      {canRenew && (
        <button
          className="odoo-button odoo-success"
          onClick={onRenew}
        >
          <i className="bi bi-arrow-repeat"></i>
          Renew Lease
        </button>
      )}

      {canCancel && (
        <button
          className={`odoo-button odoo-danger ${isCancelling ? 'loading' : ''}`}
          onClick={onCancel}
          disabled={isCancelling}
        >
          {!isCancelling && <i className="bi bi-x-circle"></i>}
          {isCancelling ? 'Cancelling...' : 'Cancel Lease'}
        </button>
      )}
    </div>
  );
};

LeaseActionButtons.propTypes = {
  lease: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
  isGeneratingPDF: PropTypes.bool.isRequired,
  isCancelling: PropTypes.bool.isRequired,
  onPreviewDocument: PropTypes.func.isRequired,
  onRenew: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default LeaseActionButtons;
