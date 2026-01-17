/**
 * ChangePasswordModal Component
 * Modal for changing user password
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const ChangePasswordModal = ({
  show,
  onHide,
  passwordForm,
  passwordError,
  passwordSuccess,
  passwordLoading,
  onPasswordChange,
  onSubmit
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-key me-2"></i>
          Change Password
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {passwordError && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {passwordError}
          </Alert>
        )}
        
        {passwordSuccess && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            {passwordSuccess}
          </Alert>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onPasswordChange}
              placeholder="Enter current password"
              disabled={passwordLoading}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onPasswordChange}
              placeholder="Enter new password"
              disabled={passwordLoading}
            />
            <Form.Text className="text-muted">
              Password must be at least 6 characters long
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onPasswordChange}
              placeholder="Confirm new password"
              disabled={passwordLoading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={passwordLoading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={passwordLoading}>
          {passwordLoading ? 'Changing...' : 'Change Password'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ChangePasswordModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  passwordForm: PropTypes.shape({
    currentPassword: PropTypes.string,
    newPassword: PropTypes.string,
    confirmPassword: PropTypes.string,
  }).isRequired,
  passwordError: PropTypes.string,
  passwordSuccess: PropTypes.string,
  passwordLoading: PropTypes.bool.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
