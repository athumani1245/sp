import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ 
  show, 
  onClose, 
  title, 
  message, 
  variant = 'success', 
  autoHide = true, 
  delay = 3000 
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    
    if (show && autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose && onClose(), 150); // Allow fade out animation
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, delay, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose && onClose(), 150);
  };

  return (
    <div 
      className={`toast show position-fixed top-0 end-0 m-3`} 
      role="alert" 
      style={{ 
        zIndex: 9999,
        minWidth: '300px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease-in-out'
      }}
    >
      <div className={`toast-header bg-${variant} text-white`}>
        <i className={`bi ${getIcon()} me-2`}></i>
        <strong className="me-auto">{title}</strong>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          onClick={handleClose}
          aria-label="Close"
        ></button>
      </div>
      {message && (
        <div className="toast-body">
          {message}
        </div>
      )}
    </div>
  );
};

Toast.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info']),
  autoHide: PropTypes.bool,
  delay: PropTypes.number,
};

Toast.defaultProps = {
  variant: 'success',
  autoHide: true,
  delay: 3000,
  title: '',
};

export default Toast;