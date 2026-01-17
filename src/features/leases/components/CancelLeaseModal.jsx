/**
 * CancelLeaseModal Component
 * Confirmation modal for cancelling a lease
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Alert } from 'react-bootstrap';
import { LeasePropType } from '../../../shared/types/propTypes';

const getUnitInfo = (lease) => {
  if (lease.unit_number) return lease.unit_number;
  if (lease.unit_name) return lease.unit_name;
  if (lease.unit?.unit_name) return lease.unit.unit_name;
  if (lease.unit?.unit_number) return lease.unit.unit_number;
  return 'Unknown Unit';
};

const CancelLeaseModal = ({
  show,
  onHide,
  onConfirm,
  lease,
  isCancelling,
  error
}) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
          Cancel Lease
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="text-center py-3">
          <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3 mb-3">Are you sure you want to cancel this lease?</h5>
          <p className="text-muted mb-4">
            This action will immediately cancel the lease. This cannot be undone.
          </p>
          
          <div className="mt-3 p-3 bg-light rounded">
            <strong>Lease Details:</strong>
            <ul className="mt-2 mb-0 text-start">
              <li>Tenant: {lease.tenant?.first_name || 'N/A'} {lease.tenant?.last_name || ''}</li>
              <li>Property: {lease.property?.property_name || 'N/A'}</li>
              <li>Unit: {getUnitInfo(lease)}</li>
              <li>Duration: {lease.number_of_month} months</li>
            </ul>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isCancelling}>
          <i className="bi bi-x-circle me-2"></i>
          No, Keep Lease
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isCancelling}>
          <i className="bi bi-check-circle me-2"></i>
          {isCancelling ? 'Cancelling...' : 'Yes, Cancel Lease'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

CancelLeaseModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  lease: LeasePropType.isRequired,
  isCancelling: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default CancelLeaseModal;
