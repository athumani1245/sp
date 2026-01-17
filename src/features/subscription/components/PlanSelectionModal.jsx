/**
 * PlanSelectionModal Component
 * Modal for selecting a specific plan from a package
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

const PlanSelectionModal = ({ show, onHide, selectedPackage, onSelectPlan }) => {
  if (!selectedPackage) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e3e6e8' }}>
        <Modal.Title style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          Select a Plan - {selectedPackage.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '2rem' }}>
        {selectedPackage.plans && selectedPackage.plans.length > 0 ? (
          <div className="row">
            {selectedPackage.plans.map((plan) => (
              <div key={plan.id} className="col-md-6 mb-3">
                <div
                  style={{
                    border: '1px solid #e3e6e8',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    backgroundColor: '#fff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#CC5B4B';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(204, 91, 75, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e3e6e8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => onSelectPlan(plan)}
                >
                  <h5 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {plan.name}
                  </h5>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#CC5B4B', marginBottom: '1rem' }}>
                    TSH {parseFloat(plan.price).toLocaleString()}
                    <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#6c757d' }}>
                      /{plan.duration_days} days
                    </span>
                  </div>

                  {plan.description && (
                    <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1rem' }}>
                      {plan.description}
                    </p>
                  )}

                  <div style={{ marginBottom: '1rem', flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#222', marginBottom: '0.5rem', textAlign: 'left' }}>
                      {plan.max_units && (
                        <div className="mb-2" style={{ textAlign: 'left' }}>
                          <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                          Up to {plan.max_units} units
                        </div>
                      )}
                      {plan.max_property_managers && (
                        <div className="mb-2" style={{ textAlign: 'left' }}>
                          <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                          Up to {plan.max_property_managers} property managers
                        </div>
                      )}
                      {plan.allow_sms_notifications && (
                        <div className="mb-2" style={{ textAlign: 'left' }}>
                          <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                          SMS Notifications
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="odoo-btn"
                    style={{
                      width: '100%',
                      border: '2px solid #CC5B4B',
                      backgroundColor: 'transparent',
                      color: '#CC5B4B',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#CC5B4B';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#CC5B4B';
                    }}
                  >
                    Subscribe to {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p style={{ color: '#6c757d' }}>No plans available for this package.</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

PlanSelectionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  selectedPackage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    plans: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        duration_days: PropTypes.number,
        description: PropTypes.string,
        max_units: PropTypes.number,
        max_property_managers: PropTypes.number,
        allow_sms_notifications: PropTypes.bool,
      })
    ),
  }),
  onSelectPlan: PropTypes.func.isRequired,
};

export default PlanSelectionModal;
