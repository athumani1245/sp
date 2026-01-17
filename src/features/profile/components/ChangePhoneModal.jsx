/**
 * ChangePhoneModal Component
 * Modal for changing phone number with OTP verification
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input';

const ChangePhoneModal = ({
  show,
  onHide,
  phoneStep,
  newPhone,
  phoneOtp,
  phoneError,
  phoneSuccess,
  phoneLoading,
  countdown,
  canResendOtp,
  otpInputRefs,
  onPhoneChange,
  onSendOtp,
  onOtpChange,
  onOtpKeyDown,
  onVerifyOtp,
  onResendOtp
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-phone me-2"></i>
          Change Phone Number
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {phoneError && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {phoneError}
          </Alert>
        )}
        
        {phoneSuccess && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            {phoneSuccess}
          </Alert>
        )}
        
        {phoneStep === 'input' && (
          <Form>
            <Form.Group>
              <Form.Label>New Phone Number</Form.Label>
              <PhoneInput
                international
                defaultCountry="TZ"
                value={newPhone}
                onChange={onPhoneChange}
                disabled={phoneLoading}
                className="form-control"
              />
              <Form.Text className="text-muted">
                We'll send you a verification code to this number
              </Form.Text>
            </Form.Group>
          </Form>
        )}
        
        {phoneStep === 'otp' && (
          <div>
            <p className="text-muted mb-3">
              Enter the 4-digit code sent to <strong>{newPhone}</strong>
            </p>
            
            <div className="d-flex justify-content-center gap-2 mb-3">
              {phoneOtp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpInputRefs[index]}
                  type="text"
                  maxLength="1"
                  className="form-control text-center otp-input"
                  value={digit}
                  onChange={(e) => onOtpChange(index, e.target.value)}
                  onKeyDown={(e) => onOtpKeyDown(index, e)}
                  disabled={phoneLoading}
                  style={{ width: '50px', fontSize: '1.5rem' }}
                />
              ))}
            </div>
            
            <div className="text-center">
              {!canResendOtp ? (
                <p className="text-muted">
                  Resend code in <strong>{countdown}s</strong>
                </p>
              ) : (
                <Button
                  variant="link"
                  onClick={onResendOtp}
                  disabled={phoneLoading}
                >
                  Resend Code
                </Button>
              )}
            </div>
          </div>
        )}
        
        {phoneStep === 'success' && (
          <div className="text-center py-4">
            <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">Phone Number Changed!</h5>
            <p className="text-muted">Your phone number has been updated successfully.</p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={phoneLoading}>
          {phoneStep === 'success' ? 'Close' : 'Cancel'}
        </Button>
        
        {phoneStep === 'input' && (
          <Button variant="primary" onClick={onSendOtp} disabled={phoneLoading || !newPhone}>
            {phoneLoading ? 'Sending...' : 'Send Code'}
          </Button>
        )}
        
        {phoneStep === 'otp' && (
          <Button variant="primary" onClick={onVerifyOtp} disabled={phoneLoading}>
            {phoneLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

ChangePhoneModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  phoneStep: PropTypes.oneOf(['input', 'otp', 'success']).isRequired,
  newPhone: PropTypes.string,
  phoneOtp: PropTypes.arrayOf(PropTypes.string).isRequired,
  phoneError: PropTypes.string,
  phoneSuccess: PropTypes.string,
  phoneLoading: PropTypes.bool.isRequired,
  countdown: PropTypes.number.isRequired,
  canResendOtp: PropTypes.bool.isRequired,
  otpInputRefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPhoneChange: PropTypes.func.isRequired,
  onSendOtp: PropTypes.func.isRequired,
  onOtpChange: PropTypes.func.isRequired,
  onOtpKeyDown: PropTypes.func.isRequired,
  onVerifyOtp: PropTypes.func.isRequired,
  onResendOtp: PropTypes.func.isRequired,
};

export default ChangePhoneModal;
