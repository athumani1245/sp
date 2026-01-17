/**
 * AddLeaseModal - Odoo-style minimal design
 * Clean and simple lease creation form
 */

import React, { useEffect, useCallback } from 'react';
import { Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { SearchableSelect } from '../common/SearchableSelect';
import { formatNumberWithCommas } from '../../utils/formatUtils';
import { useLeaseFormData } from '../../features/leases/hooks/useLeaseFormData';
import { useLeaseFormResources } from '../../features/leases/hooks/useLeaseFormResources';
import { usePaymentManagement } from '../../features/leases/hooks/usePaymentManagement';
import { useLeaseSubmit } from '../../features/leases/hooks/useLeaseSubmit';
import '../../assets/styles/leases.css';

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
  const setError = useCallback((err) => {
    setResourceError(err);
    setSubmitError(err);
  }, [setResourceError, setSubmitError]);

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
      size="lg"
    >
      <Modal.Header closeButton style={{ 
        borderBottom: '1px solid #e9ecef',
        padding: '10px 16px',
        backgroundColor: '#f8f9fa'
      }}>
        <Modal.Title style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
          Create Lease
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ padding: '16px', backgroundColor: '#fff' }}>
          {error && (
            <Alert variant="danger" style={{ marginBottom: '12px', fontSize: '13px', padding: '8px 12px' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" style={{ marginBottom: '12px', fontSize: '13px', padding: '8px 12px' }}>
              {success}
            </Alert>
          )}

          {/* Top Section: General Info and Financial Details */}
          <Row>
            {/* Left Column: General Information */}
            <Col md={6}>
              <h6 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#495057' }}>
                General Information
              </h6>
              
              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Tenant <span style={{ color: '#dc3545' }}>*</span>
                  </Form.Label>
                </Col>
                <Col md={7}>
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
                    inputStyle={{ fontSize: '12px', minHeight: '31px' }}
                  />
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Property <span style={{ color: '#dc3545' }}>*</span>
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <SearchableSelect
                    options={properties}
                    value={formData.property_id}
                    onChange={handleFormInputChange}
                    placeholder="Select Property"
                    disabled={loading}
                    name="property_id"
                    getOptionLabel={(p) => p.property_name || p.name}
                    getOptionValue={(p) => p.id}
                    noOptionsMessage="No properties available"
                    inputStyle={{ fontSize: '12px', minHeight: '31px' }}
                  />
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Unit <span style={{ color: '#dc3545' }}>*</span>
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <SearchableSelect
                    options={availableUnits}
                    value={formData.unit}
                    onChange={handleFormInputChange}
                    placeholder="Select Unit"
                    disabled={loading || !formData.property_id}
                    name="unit"
                    getOptionLabel={(u) => u.unit_name || u.unit_number}
                    getOptionValue={(u) => u.id}
                    noOptionsMessage="No available units"
                    inputStyle={{ fontSize: '12px', minHeight: '31px' }}
                  />
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Start Date <span style={{ color: '#dc3545' }}>*</span>
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleFormInputChange}
                    size="sm"
                    style={{ fontSize: '12px' }}
                  />
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Duration (Months) <span style={{ color: '#dc3545' }}>*</span>
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="number"
                    name="number_of_month"
                    value={formData.number_of_month}
                    onChange={handleFormInputChange}
                    min="1"
                    placeholder="Enter months"
                    size="sm"
                    style={{ fontSize: '12px' }}
                  />
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#6c757d', paddingTop: '6px', marginBottom: 0 }}>
                    End Date
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    readOnly
                    size="sm"
                    style={{ fontSize: '12px', backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                </Col>
              </Row>
            </Col>

            {/* Right Column: Financial Details */}
            <Col md={6}>
              <h6 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#495057' }}>
                Financial Details
              </h6>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Monthly Rent <span style={{ color: '#dc3545' }}>*</span>
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      name="rent_amount_per_unit"
                      value={formatNumberWithCommas(formData.rent_amount_per_unit)}
                      onChange={handleFormInputChange}
                      placeholder="0.00"
                      size="sm"
                      style={{ fontSize: '12px', flex: 1 }}
                    />
                    <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '6px', whiteSpace: 'nowrap' }}>
                      per Units
                    </span>
                  </div>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#6c757d', paddingTop: '6px', marginBottom: 0 }}>
                    Total Amount
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="text"
                    value={formatNumberWithCommas(formData.total_amount)}
                    readOnly
                    size="sm"
                    style={{ fontSize: '12px', backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={5}>
                  <Form.Label style={{ fontSize: '12px', color: '#495057', paddingTop: '6px', marginBottom: 0 }}>
                    Discount
                  </Form.Label>
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="text"
                    name="discount"
                    value={formatNumberWithCommas(formData.discount)}
                    onChange={handleFormInputChange}
                    placeholder="0.00"
                    size="sm"
                    style={{ fontSize: '12px' }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Divider */}
          <hr style={{ margin: '16px 0', borderColor: '#e9ecef' }} />

          {/* Payments Section */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#495057' }}>
                Payments
              </h6>
              {!isAddingPayment && (
                <button 
                  type="button"
                  className="odoo-button odoo-primary"
                  onClick={startAddingPayment}
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add
                </button>
              )}
            </div>

            {isAddingPayment && (
              <div style={{ 
                border: '1px solid #dee2e6', 
                borderRadius: '4px', 
                padding: '10px', 
                marginBottom: '10px',
                backgroundColor: '#f8f9fa'
              }}>
                <Row className="mb-2">
                  <Col md={2}>
                    <Form.Label style={{ fontSize: '11px', marginBottom: '3px' }}>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={currentPayment.payment_date}
                      onChange={(e) => handlePaymentChange('payment_date', e.target.value)}
                      size="sm"
                      style={{ fontSize: '12px', height: '31px' }}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label style={{ fontSize: '11px', marginBottom: '3px' }}>Category</Form.Label>
                    <Form.Select
                      value={currentPayment.category}
                      onChange={(e) => handlePaymentChange('category', e.target.value)}
                      size="sm"
                      style={{ fontSize: '12px', height: '31px' }}
                    >
                      <option value="">Select</option>
                      {PAYMENT_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label style={{ fontSize: '11px', marginBottom: '3px' }}>Source</Form.Label>
                    <Form.Select
                      value={currentPayment.payment_source}
                      onChange={(e) => handlePaymentChange('payment_source', e.target.value)}
                      size="sm"
                      style={{ fontSize: '12px', height: '31px' }}
                    >
                      <option value="">Select</option>
                      {PAYMENT_SOURCES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label style={{ fontSize: '11px', marginBottom: '3px' }}>Amount</Form.Label>
                    <Form.Control
                      type="text"
                      value={formatNumberWithCommas(currentPayment.amount_paid)}
                      onChange={(e) => handlePaymentChange('amount_paid', e.target.value)}
                      placeholder="0.00"
                      size="sm"
                      style={{ fontSize: '12px', height: '31px' }}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <div className="d-flex gap-1">
                      <button 
                        type="button"
                        className="odoo-button odoo-success"
                        onClick={handleAddPayment}
                        style={{ padding: '4px 8px', fontSize: '12px', height: '31px' }}
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                      <button 
                        type="button"
                        className="odoo-button odoo-danger"
                        onClick={cancelPayment}
                        style={{ padding: '4px 8px', fontSize: '12px', height: '31px' }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {formData.payments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-hover" style={{ fontSize: '12px', marginBottom: 0 }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '6px', fontWeight: '500' }}>Date</th>
                      <th style={{ padding: '6px', fontWeight: '500' }}>Category</th>
                      <th style={{ padding: '6px', fontWeight: '500' }}>Source</th>
                      <th style={{ padding: '6px', fontWeight: '500' }}>Amount</th>
                      <th style={{ padding: '6px', fontWeight: '500', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.payments.map(payment => (
                      <tr key={payment.id}>
                        <td style={{ padding: '6px' }}>{payment.payment_date}</td>
                        <td style={{ padding: '6px' }}>{payment.category}</td>
                        <td style={{ padding: '6px' }}>{payment.payment_source}</td>
                        <td style={{ padding: '6px' }}>TSh {formatNumberWithCommas(payment.amount_paid)}</td>
                        <td style={{ padding: '6px' }}>
                          <button
                            type="button"
                            className="odoo-button odoo-danger"
                            onClick={() => removePayment(payment.id)}
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#6c757d',
                fontSize: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                No payments added yet
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer style={{ 
          borderTop: '1px solid #e9ecef',
          padding: '10px 16px',
          backgroundColor: '#f8f9fa',
          gap: '8px'
        }}>
          <button 
            type="button"
            className="odoo-button odoo-secondary"
            onClick={onClose} 
            disabled={submitLoading}
            style={{ fontSize: '12px', padding: '5px 14px' }}
          >
            Discard
          </button>
          <button 
            type="submit"
            className="odoo-button odoo-primary"
            disabled={submitLoading || loading}
            style={{ fontSize: '12px', padding: '5px 14px' }}
          >
            {submitLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" style={{ width: '11px', height: '11px' }}></span>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddLeaseModal;
