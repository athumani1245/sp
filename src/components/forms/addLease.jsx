/**
 * AddLeaseModal - Refactored
 * Simplified lease creation form
 */

import React, { useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { SearchableSelect } from '../common/SearchableSelect';
import { InfoTooltip } from '../common/Tooltip';
import { formatNumberWithCommas } from '../../utils/formatUtils';
import { useLeaseFormData } from '../../features/leases/hooks/useLeaseFormData';
import { useLeaseFormResources } from '../../features/leases/hooks/useLeaseFormResources';
import { usePaymentManagement } from '../../features/leases/hooks/usePaymentManagement';
import { useLeaseSubmit } from '../../features/leases/hooks/useLeaseSubmit';
import '../../assets/styles/add-lease.css';
import '../../assets/styles/forms-responsive.css';

const UNDERLINE_INPUT_STYLES = {
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  borderRadius: '0',
  backgroundColor: 'transparent',
  padding: '8px 0',
  fontSize: '0.95rem',
  transition: 'border-bottom-color 0.3s ease',
  boxShadow: 'none'
};

const PAYMENT_CATEGORIES = [
  { value: 'RENT', label: 'Rent' },
  { value: 'Security Deposit', label: 'Security Deposit' },
  { value: 'WATER', label: 'Water' },
  { value: 'SERVICE_CHARGE', label: 'Service Charge' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'OTHER', label: 'Other' }
];

const PAYMENT_SOURCES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' }
];

const AddLeaseModal = ({ isOpen, onClose, onLeaseAdded }) => {
  const {
    formData,
    handleInputChange,
    updateTenantInfo,
    addPayment,
    removePayment,
    resetForm,
    validateForm,
  } = useLeaseFormData();

  const {
    properties,
    tenants,
    availableUnits,
    loading,
    error: resourceError,
    setError: setResourceError,
    loadAvailableUnits,
  } = useLeaseFormResources(isOpen);

  const {
    currentPayment,
    isAddingPayment,
    handlePaymentChange,
    validatePayment,
    startAddingPayment,
    cancelPayment,
    resetAll: resetPaymentAll,
  } = usePaymentManagement();

  const {
    submitLoading,
    error: submitError,
    success,
    setError: setSubmitError,
    setSuccess,
    handleSubmit,
  } = useLeaseSubmit(formData, tenants, validateForm, () => {
    if (onLeaseAdded) onLeaseAdded();
    setTimeout(() => onClose(), 1500);
  });

  const error = resourceError || submitError;
  const setError = (err) => {
    setResourceError(err);
    setSubmitError(err);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      resetPaymentAll();
      setError('');
      setSuccess('');
    }
  }, [isOpen, resetForm, resetPaymentAll, setError, setSuccess]);

  const handlePropertyChange = useCallback((value) => {
    loadAvailableUnits(value);
  }, [loadAvailableUnits]);

  const handleTenantChange = useCallback((value) => {
    const selectedTenant = tenants.find(t => t.id === parseInt(value) || t.id === value);
    if (selectedTenant) {
      updateTenantInfo(selectedTenant);
    }
  }, [tenants, updateTenantInfo]);

  const handleUnitChange = useCallback((value) => {
    const selectedUnit = availableUnits.find(unit => unit.id.toString() === value);
    return selectedUnit ? {
      rentAmount: selectedUnit.rent_per_month || selectedUnit.rent_amount || 0
    } : null;
  }, [availableUnits]);

  const handleFormInputChange = useCallback((e) => {
    handleInputChange(e, {
      onPropertyChange: handlePropertyChange,
      onTenantChange: handleTenantChange,
      onUnitChange: handleUnitChange,
      onClearError: () => {
        setError('');
        setSuccess('');
      }
    });
  }, [handleInputChange, handlePropertyChange, handleTenantChange, handleUnitChange, setError, setSuccess]);

  const handleAddPayment = () => {
    const validation = validatePayment();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    addPayment({
      ...currentPayment,
      amount_paid: parseFloat(currentPayment.amount_paid)
    });
    cancelPayment();
    setError('');
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      className="responsive-modal"
      dialogClassName="modal-95w"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="text-center w-100 h5 fw-bold text-dark">
          <i className="bi bi-file-earmark-plus me-2 text-danger"></i>
          New Lease Agreement
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </Alert>
          )}

          <Row className="g-4">
            {/* Left Column */}
            <Col lg={6}>
              <div className="form-section-header mb-3">
                <i className="fas fa-user text-danger"></i>
                Property and Tenant Selection
              </div>

              <Form.Group className="mb-3">
                <Form.Label>
                  Tenant *
                  <InfoTooltip content="Select the tenant who will occupy this unit" />
                </Form.Label>
                <SearchableSelect
                  options={tenants}
                  value={formData.tenant_id}
                  onChange={handleFormInputChange}
                  placeholder="Select Tenant"
                  disabled={loading}
                  name="tenant_id"
                  getOptionLabel={(t) => `${t.first_name} ${t.last_name} - ${t.username || t.phone}`}
                  getOptionValue={(t) => t.id}
                  noOptionsMessage="No tenants available"
                />
              </Form.Group>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Property *
                      <InfoTooltip content="Select the property" />
                    </Form.Label>
                    <SearchableSelect
                      options={properties}
                      value={formData.property_id}
                      onChange={handleFormInputChange}
                      placeholder="Select Property"
                      disabled={loading}
                      name="property_id"
                      getOptionLabel={(p) => p.name}
                      getOptionValue={(p) => p.id}
                      noOptionsMessage="No properties available"
                    />
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Unit *
                      <InfoTooltip content="Select an available unit" />
                    </Form.Label>
                    <SearchableSelect
                      options={availableUnits}
                      value={formData.unit}
                      onChange={handleFormInputChange}
                      placeholder="Select Unit"
                      disabled={loading || !formData.property_id}
                      name="unit"
                      getOptionLabel={(u) => u.unit_number}
                      getOptionValue={(u) => u.id}
                      noOptionsMessage="No available units"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleFormInputChange}
                      style={UNDERLINE_INPUT_STYLES}
                    />
                  </Form.Group>
                </Col>

                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (Months) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="number_of_month"
                      value={formData.number_of_month}
                      onChange={handleFormInputChange}
                      min="1"
                      placeholder="Enter months"
                      style={UNDERLINE_INPUT_STYLES}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  readOnly
                  style={{ ...UNDERLINE_INPUT_STYLES, cursor: 'not-allowed', color: '#6c757d' }}
                />
              </Form.Group>
            </Col>

            {/* Right Column */}
            <Col lg={6}>
              <div className="form-section-header mb-3">
                <i className="fas fa-dollar-sign text-danger"></i>
                Financial Details
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Monthly Rent *</Form.Label>
                <Form.Control
                  type="text"
                  name="rent_amount_per_unit"
                  value={formatNumberWithCommas(formData.rent_amount_per_unit)}
                  onChange={handleFormInputChange}
                  placeholder="0.00"
                  style={UNDERLINE_INPUT_STYLES}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithCommas(formData.total_amount)}
                  readOnly
                  style={{ ...UNDERLINE_INPUT_STYLES, cursor: 'not-allowed', color: '#6c757d' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Discount</Form.Label>
                <Form.Control
                  type="text"
                  name="discount"
                  value={formatNumberWithCommas(formData.discount)}
                  onChange={handleFormInputChange}
                  placeholder="0.00"
                  style={UNDERLINE_INPUT_STYLES}
                />
              </Form.Group>

              {/* Payments Section */}
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Payments</h6>
                  {!isAddingPayment && (
                    <Button size="sm" variant="outline-primary" onClick={startAddingPayment}>
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Payment
                    </Button>
                  )}
                </div>

                {isAddingPayment && (
                  <div className="border rounded p-3 mb-3">
                    <Row>
                      <Col sm={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={currentPayment.payment_date}
                            onChange={(e) => handlePaymentChange('payment_date', e.target.value)}
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Category</Form.Label>
                          <Form.Select
                            value={currentPayment.category}
                            onChange={(e) => handlePaymentChange('category', e.target.value)}
                            size="sm"
                          >
                            <option value="">Select</option>
                            {PAYMENT_CATEGORIES.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Source</Form.Label>
                          <Form.Select
                            value={currentPayment.payment_source}
                            onChange={(e) => handlePaymentChange('payment_source', e.target.value)}
                            size="sm"
                          >
                            <option value="">Select</option>
                            {PAYMENT_SOURCES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Amount</Form.Label>
                          <Form.Control
                            type="text"
                            value={formatNumberWithCommas(currentPayment.amount_paid)}
                            onChange={(e) => handlePaymentChange('amount_paid', e.target.value)}
                            placeholder="0.00"
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex gap-2 mt-2">
                      <Button size="sm" variant="success" onClick={handleAddPayment}>
                        Add
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelPayment}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {formData.payments.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.payments.map(payment => (
                          <tr key={payment.id}>
                            <td>{payment.payment_date}</td>
                            <td>{payment.category}</td>
                            <td>{formatNumberWithCommas(payment.amount_paid)}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => removePayment(payment.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={onClose} disabled={submitLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitLoading || loading}>
            {submitLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              'Create Lease'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddLeaseModal;
