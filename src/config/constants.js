/**
 * Application-wide constants
 * Centralized configuration for consistent values across the app
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_OTP: '/auth/verify-otp',
  
  // Properties
  PROPERTIES: '/properties',
  PROPERTY_BY_ID: (id) => `/properties/${id}`,
  PROPERTY_UNITS: (id) => `/properties/${id}/units`,
  PROPERTY_MANAGERS: '/property-managers',
  
  // Leases
  LEASES: '/leases',
  LEASE_BY_ID: (id) => `/leases/${id}`,
  
  // Tenants
  TENANTS: '/tenants',
  TENANT_BY_ID: (id) => `/tenants/${id}`,
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id) => `/payments/${id}`,
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Reports
  REPORTS: '/reports',
  
  // Profile
  PROFILE: '/profile',
  UPDATE_PROFILE: '/profile/update',
  CHANGE_PASSWORD: '/profile/change-password',
  
  // Subscription
  SUBSCRIPTION: '/subscription',
  PACKAGES: '/packages',
  
  // Locations
  REGIONS: '/regions',
  DISTRICTS: '/districts',
  WARDS: '/wards',
};

// Application Routes
export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OTP_VERIFY: '/otp-verify',
  PRIVACY_POLICY: '/privacy-policy',
  
  // Protected
  DASHBOARD: '/dashboard',
  HOME: '/home',
  
  // Properties
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: (id) => `/properties/${id}`,
  PROPERTY_MANAGERS: '/property-managers',
  
  // Leases
  LEASES: '/leases',
  LEASE_DETAILS: (id) => `/leases/${id}`,
  ADD_LEASE: '/add-lease',
  
  // Tenants
  TENANTS: '/tenants',
  TENANT_DETAILS: (id) => `/tenants/${id}`,
  
  // Reports
  REPORTS: '/reports',
  REPORT_PROPERTY_SUMMARY: '/reports/property-summary',
  REPORT_LEASE_AGREEMENTS: '/reports/lease-agreements',
  REPORT_TENANT_PAYMENT_HISTORY: '/reports/tenant-payment-history',
  REPORT_LEASE_EXPIRY: '/reports/lease-expiry',
  REPORT_PROPERTY_PERFORMANCE: '/reports/property-performance',
  REPORT_TENANT_OUTSTANDING: '/reports/tenant-outstanding-balance',
  
  // Other
  PROFILE: '/profile',
  SUBSCRIPTION: '/subscription',
};

// Pagination Configuration
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 1000,
  INITIAL_PAGE: 1,
};

// Status Values
export const LEASE_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  TERMINATED: 'terminated',
  EXPIRED: 'expired',
  ENDED: 'ended',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const PROPERTY_TYPE = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
};

export const UNIT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
};

export const MANAGER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 500,
  OTP_LENGTH: 4,
  OTP_COUNTDOWN: 60,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_MIN_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9+\s-()]+$/,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD-MM-YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'DD-MM-YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SAVED: 'Saved successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Registration successful!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  TOUR_PROGRESS: 'tourProgress',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Environment Configuration
export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  IS_PRODUCTION: process.env.REACT_APP_ENVIRONMENT === 'production',
  IS_DEVELOPMENT: process.env.REACT_APP_ENVIRONMENT === 'development',
};

// Export Type
export const EXPORT_TYPES = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
};

// Report Types
export const REPORT_TYPES = {
  LEASE_AGREEMENTS: 'lease_agreements',
  PROPERTY_SUMMARY: 'property_summary',
  TENANT_PAYMENT_HISTORY: 'tenant_payment_history',
  PROPERTY_PERFORMANCE: 'property_performance',
  TENANT_OUTSTANDING: 'tenant_outstanding_balance',
  LEASE_EXPIRY: 'lease_expiry',
};

// Tour IDs
export const TOUR_IDS = {
  DASHBOARD: 'dashboard',
  ADD_PROPERTY: 'addProperty',
  ADD_UNIT: 'addUnit',
  ADD_TENANT: 'addTenant',
  ADD_LEASE: 'addLease',
  ADD_PAYMENT: 'addPayment',
  PROPERTY_DETAILS: 'propertyDetails',
};
