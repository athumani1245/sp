/**
 * PaymentModal Component
 * Modal for handling mobile money payment flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const PaymentModal = ({
  show,
  onHide,
  paymentStatus,
  phoneNumber,
  selectedPlan,
  subscriptionError,
  apiResponseDescription,
  subscribing,
  onPhoneNumberChange,
  onSubmitPayment,
  onPaymentSuccess,
}) => {
  const canClose = paymentStatus !== 'processing';

  return (
    <Modal
      show={show}
      onHide={canClose ? onHide : undefined}
      backdrop={canClose ? true : 'static'}
      keyboard={canClose}
      centered
      style={{ zIndex: 1070 }}
    >
      <Modal.Header closeButton={canClose}>
        <Modal.Title>
          {paymentStatus === 'input' && (
            <>
              <i className="bi bi-credit-card text-primary me-2"></i>
              Payment Details
            </>
          )}
          {paymentStatus === 'processing' && (
            <>
              <i className="bi bi-phone text-primary me-2"></i>
              Complete Payment on Your Phone
            </>
          )}
          {paymentStatus === 'success' && (
            <>
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              Payment Successful
            </>
          )}
          {paymentStatus === 'failed' && (
            <>
              <i className="bi bi-x-circle-fill text-danger me-2"></i>
              Payment Failed
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {paymentStatus === 'input' && selectedPlan && (
          <div>
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="mb-3">Subscription Details:</h6>
              <div className="row mb-2">
                <div className="col-5 text-muted">Plan:</div>
                <div className="col-7 fw-bold">{selectedPlan.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-5 text-muted">Duration:</div>
                <div className="col-7">{selectedPlan.duration_days} days</div>
              </div>
              <div className="row">
                <div className="col-5 text-muted">Amount:</div>
                <div className="col-7 fw-bold text-success">
                  TSH {parseFloat(selectedPlan.price).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="mb-3">Payment Method</h6>
              <p className="text-muted small mb-2">Available payment networks:</p>
              <div className="d-flex gap-3 mb-3">
                <div className="text-center" style={{ width: '100px' }}>
                  <img
                    src="https://cdn-ilcckcd.nitrocdn.com/vFwIYMXbhaEqIyBSDvrIYygCHfqnLHOc/assets/images/optimized/rev-4c4b0df/yas.co.tz/wp-content/uploads/2024/10/jem_logo.svg"
                    alt="Yas Tanzania"
                    className="img-fluid mb-2"
                    style={{ height: '40px', objectFit: 'contain' }}
                  />
                  <div className="text-center small text-muted">Yas Tanzania</div>
                </div>
                <div className="text-center" style={{ width: '100px' }}>
                  <img
                    src="https://cdn-webportal.airtelstream.net/website/tanzania/assets/images/logo.svg"
                    alt="Airtel"
                    className="img-fluid mb-2"
                    style={{ height: '40px', objectFit: 'contain' }}
                  />
                  <div className="text-center small text-muted">Airtel</div>
                </div>
                <div className="text-center" style={{ width: '100px' }}>
                  <img
                    src="https://halotel.co.tz/themes/halotel/images/logo4.png"
                    alt="Halotel"
                    className="img-fluid mb-2"
                    style={{ height: '40px', objectFit: 'contain' }}
                  />
                  <div className="text-center small text-muted">Halotel</div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text">
                  <img
                    src="https://flagcdn.com/w20/tz.png"
                    alt="Tanzania flag"
                    className="me-1"
                    style={{ height: '15px' }}
                  />
                  +255
                </span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 9) {
                      onPhoneNumberChange(value);
                    }
                  }}
                />
              </div>
              <div className="form-text">Enter your mobile money number without the country code</div>
            </div>

            {subscriptionError && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {subscriptionError}
              </div>
            )}

            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              A payment prompt will be sent to your phone. Please enter your PIN to complete the payment.
            </div>
          </div>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center py-4">
            <div className="mb-4">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Processing...</span>
              </div>
              <h5 className="mb-3">Waiting for Payment Confirmation</h5>
            </div>

            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>
                {apiResponseDescription || 'Please check your phone for a payment prompt'}
              </strong>
            </div>

            <div className="bg-light p-4 rounded mb-4">
              <div className="row text-start">
                <div className="col-6">
                  <strong className="text-muted d-block mb-1">Amount:</strong>
                  <span className="text-success fw-bold">
                    TSH {selectedPlan ? parseFloat(selectedPlan.price).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="col-6">
                  <strong className="text-muted d-block mb-1">Phone:</strong>
                  <span>+255 {phoneNumber}</span>
                </div>
              </div>
            </div>

            <div className="text-muted small mt-4">
              <i className="bi bi-clock me-1"></i>
              This may take a few moments to process...
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-4">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="text-success mb-3">Payment Completed Successfully!</h4>
            <p className="text-muted mb-4">
              Your subscription has been activated. You can now enjoy all the features of your selected plan.
            </p>

            {selectedPlan && (
              <div className="bg-light p-3 rounded mb-4">
                <div className="row">
                  <div className="col-6">
                    <strong className="d-block text-muted">Plan:</strong>
                    <span>{selectedPlan.name}</span>
                  </div>
                  <div className="col-6">
                    <strong className="d-block text-muted">Duration:</strong>
                    <span>{selectedPlan.duration_days} days</span>
                  </div>
                </div>
              </div>
            )}

            <div className="alert alert-success">
              <i className="bi bi-shield-check me-2"></i>
              Your account has been upgraded successfully!
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center py-4">
            <div className="mb-4">
              <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="text-danger mb-3">Payment Failed</h4>

            {subscriptionError && (
              <div className="alert alert-danger mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {subscriptionError}
              </div>
            )}

            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Please check your mobile money balance and try again.
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {paymentStatus === 'input' && (
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onSubmitPayment}
              disabled={!phoneNumber || phoneNumber.length !== 9}
            >
              Confirm & Pay
            </Button>
          </>
        )}

        {paymentStatus === 'processing' && (
          <Button variant="secondary" onClick={onHide} className="w-100">
            Cancel Payment
          </Button>
        )}

        {paymentStatus === 'success' && (
          <Button variant="success" onClick={onPaymentSuccess} className="w-100">
            Continue
          </Button>
        )}

        {paymentStatus === 'failed' && (
          <Button variant="secondary" onClick={onHide} className="w-100">
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

PaymentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  paymentStatus: PropTypes.oneOf(['pending', 'input', 'processing', 'success', 'failed']).isRequired,
  phoneNumber: PropTypes.string.isRequired,
  selectedPlan: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    duration_days: PropTypes.number,
  }),
  subscriptionError: PropTypes.string,
  apiResponseDescription: PropTypes.string,
  subscribing: PropTypes.bool,
  onPhoneNumberChange: PropTypes.func.isRequired,
  onSubmitPayment: PropTypes.func.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
};

export default PaymentModal;
