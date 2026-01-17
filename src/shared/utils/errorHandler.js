/**
 * Enhanced Error Handling Utilities
 * Provides comprehensive error management with types, logging, and recovery
 */

import { ERROR_MESSAGES } from '../config/constants';
import { logError } from './logger';

/**
 * Error Types Enum
 */
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTH: 'auth',
  SERVER: 'server',
  NOT_FOUND: 'not_found',
  FORBIDDEN: 'forbidden',
  CONFLICT: 'conflict',
  UNKNOWN: 'unknown',
};

/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, statusCode = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Determine error type based on status code
 * @param {number} status - HTTP status code
 * @returns {string} - Error type
 */
const getErrorTypeFromStatus = (status) => {
  const statusMap = {
    400: ERROR_TYPES.VALIDATION,
    401: ERROR_TYPES.AUTH,
    403: ERROR_TYPES.FORBIDDEN,
    404: ERROR_TYPES.NOT_FOUND,
    409: ERROR_TYPES.CONFLICT,
    422: ERROR_TYPES.VALIDATION,
    500: ERROR_TYPES.SERVER,
    502: ERROR_TYPES.NETWORK,
    503: ERROR_TYPES.NETWORK,
    504: ERROR_TYPES.NETWORK,
  };

  return statusMap[status] || ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message based on status code
 * @param {number} status - HTTP status code
 * @param {string} defaultMessage - Default message if no mapping exists
 * @returns {string} - User-friendly error message
 */
const getErrorMessageFromStatus = (status, defaultMessage) => {
  const messageMap = {
    400: ERROR_MESSAGES.VALIDATION_ERROR,
    401: ERROR_MESSAGES.UNAUTHORIZED,
    403: ERROR_MESSAGES.FORBIDDEN,
    404: ERROR_MESSAGES.NOT_FOUND,
    500: ERROR_MESSAGES.SERVER_ERROR,
    502: ERROR_MESSAGES.NETWORK_ERROR,
    503: ERROR_MESSAGES.SERVER_ERROR,
    504: ERROR_MESSAGES.NETWORK_ERROR,
  };

  return messageMap[status] || defaultMessage || ERROR_MESSAGES.GENERIC_ERROR;
};

/**
 * Enhanced API error handler
 * @param {Error} err - The error object from axios
 * @param {string} defaultMessage - Default error message
 * @param {Object} options - Additional options
 * @returns {AppError} - Standardized error object
 */
export const handleApiError = (err, defaultMessage = ERROR_MESSAGES.GENERIC_ERROR, options = {}) => {
  const { logToConsole = true, context = null } = options;

  let errorMessage = defaultMessage;
  let errorType = ERROR_TYPES.UNKNOWN;
  let statusCode = null;
  let details = null;

  // Extract error information from response
  if (err.response) {
    statusCode = err.response.status;
    errorType = getErrorTypeFromStatus(statusCode);

    // Try to extract error message from various response formats
    const responseData = err.response.data;
    if (responseData) {
      errorMessage = 
        responseData.description ||
        responseData.error ||
        responseData.message ||
        responseData.detail ||
        getErrorMessageFromStatus(statusCode, defaultMessage);
      
      // Extract validation errors if present
      if (responseData.errors || responseData.validationErrors) {
        details = responseData.errors || responseData.validationErrors;
      }
    } else {
      errorMessage = getErrorMessageFromStatus(statusCode, defaultMessage);
    }
  } else if (err.request) {
    // Request was made but no response received
    errorType = ERROR_TYPES.NETWORK;
    errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Something else happened
    errorMessage = err.message || defaultMessage;
  }

  // Create AppError instance
  const appError = new AppError(errorMessage, errorType, statusCode, details);

  // Log error if enabled
  if (logToConsole) {
    logError('API Error:', {
      message: errorMessage,
      type: errorType,
      status: statusCode,
      details: details,
      context: context,
      originalError: err,
    });
  }

  return appError;
};

/**
 * Handle validation errors
 * @param {Object} errors - Validation errors object
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const errorList = Array.isArray(messages) ? messages : [messages];
      return `${fieldName}: ${errorList.join(', ')}`;
    })
    .join('\n');

  return errorMessages || ERROR_MESSAGES.VALIDATION_ERROR;
};

/**
 * Check if error is of specific type
 * @param {Error} error - Error object
 * @param {string} type - Error type to check
 * @returns {boolean}
 */
export const isErrorType = (error, type) => {
  return error instanceof AppError && error.type === type;
};

/**
 * Check if error is recoverable
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isRecoverableError = (error) => {
  if (!(error instanceof AppError)) return false;
  
  const recoverableTypes = [
    ERROR_TYPES.VALIDATION,
    ERROR_TYPES.CONFLICT,
    ERROR_TYPES.NETWORK,
  ];
  
  return recoverableTypes.includes(error.type);
};

/**
 * Get retry-able status codes
 * @param {number} statusCode - HTTP status code
 * @returns {boolean}
 */
export const isRetryableError = (statusCode) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(statusCode);
};

/**
 * Format error for display to user
 * @param {Error} error - Error object
 * @returns {Object} - Formatted error for UI
 */
export const formatErrorForDisplay = (error) => {
  if (error instanceof AppError) {
    return {
      title: error.type === ERROR_TYPES.VALIDATION ? 'Validation Error' : 'Error',
      message: error.message,
      type: error.type,
      details: error.details,
      canRetry: isRetryableError(error.statusCode),
    };
  }

  return {
    title: 'Error',
    message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
    type: ERROR_TYPES.UNKNOWN,
    details: null,
    canRetry: false,
  };
};

/**
 * Legacy error handler for backward compatibility
 * @deprecated Use handleApiError instead
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Export for backward compatibility
export default handleApiError;
