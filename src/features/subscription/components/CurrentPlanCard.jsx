/**
 * CurrentPlanCard Component
 * Displays current subscription plan details
 */

import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../../utils/formatUtils';

const CurrentPlanCard = ({ subscription, hasActiveSubscription, onUpgradeClick }) => {
  if (!subscription) {
    return null;
  }

  return (
    <div style={{
      border: '2px solid #17a2b8',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: '#fff',
      position: 'relative',
      height: '100%'
    }}>
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '20px',
        backgroundColor: '#17a2b8',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <i className="bi bi-check" style={{ color: 'white', fontSize: '1rem' }}></i>
      </div>

      <div className="d-flex justify-content-between align-items-start" style={{ marginBottom: '1rem' }}>
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500 }}>Package Name: </span>
            <span style={{ fontSize: '0.9rem', color: '#222', fontWeight: 600 }}>
              {subscription.package_name || 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500 }}>Plan: </span>
            <span style={{ fontSize: '0.9rem', color: '#222', fontWeight: 600 }}>
              {subscription.plan_name || 'N/A'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CC5B4B' }}>
            {subscription.days_left}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            days remaining
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #e3e6e8' }}>
        <div className="row">
          <div className="col-6 mb-2">
            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>Start Date</p>
            <p style={{ fontSize: '0.8rem', color: '#222', marginBottom: 0, fontWeight: 500 }}>
              {formatDate(subscription.start_date)}
            </p>
          </div>
          <div className="col-6 mb-2">
            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>End Date</p>
            <p style={{ fontSize: '0.8rem', color: '#222', marginBottom: 0, fontWeight: 500 }}>
              {formatDate(subscription.end_date)}
            </p>
          </div>
          <div className="col-6 mb-2">
            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>Maximum Units</p>
            <p style={{ fontSize: '0.8rem', color: '#222', marginBottom: 0, fontWeight: 500 }}>
              {subscription.max_units || 'N/A'}
            </p>
          </div>
          <div className="col-6 mb-2">
            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>Status</p>
            <p style={{ fontSize: '0.8rem', color: hasActiveSubscription ? '#28a745' : '#dc3545', marginBottom: 0, fontWeight: 600 }}>
              {hasActiveSubscription ? 'Active' : 'Expired'}
            </p>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button
          className="odoo-btn"
          style={{
            flex: 1,
            border: '2px solid #CC5B4B',
            backgroundColor: 'transparent',
            color: '#CC5B4B',
            transition: 'all 0.3s ease'
          }}
          onClick={onUpgradeClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#CC5B4B';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#CC5B4B';
          }}
        >
          Upgrade
        </button>
      </div>
    </div>
  );
};

CurrentPlanCard.propTypes = {
  subscription: PropTypes.shape({
    package_name: PropTypes.string,
    plan_name: PropTypes.string,
    days_left: PropTypes.number,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    max_units: PropTypes.number,
  }),
  hasActiveSubscription: PropTypes.bool.isRequired,
  onUpgradeClick: PropTypes.func.isRequired,
};

export default CurrentPlanCard;
