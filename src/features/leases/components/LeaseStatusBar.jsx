/**
 * LeaseStatusBar Component
 * Displays lease status progression
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LEASE_STATUS } from '../../../config/constants';

const LeaseStatusBar = ({ status }) => {
  const isCompleted = (checkStatus) => {
    const statusOrder = ['draft', 'active', 'expired', 'terminated'];
    const currentIndex = statusOrder.indexOf(status);
    const checkIndex = statusOrder.indexOf(checkStatus);
    return checkIndex <= currentIndex && currentIndex >= 0;
  };

  const isActive = (checkStatus) => status === checkStatus;

  return (
    <div className="lease-status-bar">
      <div className={`status-item ${isActive(LEASE_STATUS.DRAFT) ? 'active' : isCompleted(LEASE_STATUS.DRAFT) ? 'completed' : ''}`}>
        <div className="status-dot"></div>
        <span className="status-label">Draft</span>
      </div>
      
      <div className="status-line"></div>
      
      <div className={`status-item ${isActive(LEASE_STATUS.ACTIVE) ? 'active' : isCompleted(LEASE_STATUS.ACTIVE) ? 'completed' : ''}`}>
        <div className="status-dot"></div>
        <span className="status-label">Active</span>
      </div>
      
      <div className="status-line"></div>
      
      <div className={`status-item ${isActive(LEASE_STATUS.EXPIRED) ? 'active' : isCompleted(LEASE_STATUS.EXPIRED) ? 'completed' : ''}`}>
        <div className="status-dot"></div>
        <span className="status-label">Expired</span>
      </div>
      
      <div className="status-line"></div>
      
      <div className={`status-item ${isActive(LEASE_STATUS.TERMINATED) ? 'active terminated' : ''}`}>
        <div className="status-dot"></div>
        <span className="status-label">Terminated</span>
      </div>
      
      {status === LEASE_STATUS.CANCELLED && (
        <>
          <div className="status-line cancelled"></div>
          <div className="status-item active cancelled">
            <div className="status-dot"></div>
            <span className="status-label">Cancelled</span>
          </div>
        </>
      )}
    </div>
  );
};

LeaseStatusBar.propTypes = {
  status: PropTypes.oneOf([
    LEASE_STATUS.DRAFT,
    LEASE_STATUS.ACTIVE,
    LEASE_STATUS.EXPIRED,
    LEASE_STATUS.TERMINATED,
    LEASE_STATUS.CANCELLED,
    'expiring'
  ]).isRequired,
};

export default LeaseStatusBar;
