/**
 * Common PropTypes shapes used across the application
 * Provides reusable prop type definitions for consistency
 */

import PropTypes from 'prop-types';

// Property PropTypes
export const PropertyPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  property_name: PropTypes.string.isRequired,
  property_type: PropTypes.string,
  address: PropTypes.shape({
    street: PropTypes.string,
    region: PropTypes.string,
    district: PropTypes.string,
    ward: PropTypes.string,
  }),
  managers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
  })),
  total_units: PropTypes.number,
  occupied_units: PropTypes.number,
  vacant_units: PropTypes.number,
});

// Unit PropTypes
export const UnitPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit_name: PropTypes.string.isRequired,
  unit_number: PropTypes.string,
  rent_per_month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  is_occupied: PropTypes.bool,
  property: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

// Tenant PropTypes
export const TenantPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  first_name: PropTypes.string.isRequired,
  last_name: PropTypes.string.isRequired,
  username: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  id_number: PropTypes.string,
  emergency_contact: PropTypes.string,
  emergency_contact_name: PropTypes.string,
});

// Lease PropTypes
export const LeasePropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tenant: TenantPropType,
  property: PropertyPropType,
  unit: UnitPropType,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
  rent_amount_per_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  deposit_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.oneOf(['active', 'draft', 'terminated', 'expired', 'ended']),
  payment_frequency: PropTypes.string,
  total_paid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  total_remaining: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

// Payment PropTypes
export const PaymentPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lease: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  payment_date: PropTypes.string,
  payment_method: PropTypes.string,
  reference_number: PropTypes.string,
  notes: PropTypes.string,
});

// Property Manager PropTypes
export const PropertyManagerPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  first_name: PropTypes.string.isRequired,
  last_name: PropTypes.string.isRequired,
  username: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  is_active: PropTypes.bool,
});

// Pagination PropTypes
export const PaginationPropType = PropTypes.shape({
  current_page: PropTypes.number,
  page: PropTypes.number,
  total_pages: PropTypes.number,
  totalPages: PropTypes.number,
  total: PropTypes.number,
  count: PropTypes.number,
  next: PropTypes.string,
  previous: PropTypes.string,
  page_size: PropTypes.number,
  per_page: PropTypes.number,
});

// Dashboard Stats PropTypes
export const DashboardStatsPropType = PropTypes.shape({
  total_number_of_properties: PropTypes.number,
  total_rent_collected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  total_units: PropTypes.number,
  total_expected_rent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pending_income: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  occupied_units: PropTypes.number,
  vacant_units: PropTypes.number,
});

// User Profile PropTypes
export const UserProfilePropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  username: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  role: PropTypes.string,
});

// Subscription PropTypes
export const SubscriptionPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  package_name: PropTypes.string,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
  status: PropTypes.oneOf(['active', 'expired', 'pending', 'cancelled']),
  max_properties: PropTypes.number,
  max_units: PropTypes.number,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

// Package PropTypes
export const PackagePropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  duration_days: PropTypes.number,
  max_properties: PropTypes.number,
  max_units: PropTypes.number,
  features: PropTypes.arrayOf(PropTypes.string),
});

// Location PropTypes
export const RegionPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
});

export const DistrictPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  region: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

export const WardPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  district: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

// Common Component PropTypes
export const ToastPropType = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info']),
  autoHide: PropTypes.bool,
  delay: PropTypes.number,
};

export const ModalPropType = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  centered: PropTypes.bool,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['static'])]),
};

export const ButtonPropType = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  size: PropTypes.oneOf(['sm', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// Children PropType (commonly used)
export const ChildrenPropType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]);

export default {
  PropertyPropType,
  UnitPropType,
  TenantPropType,
  LeasePropType,
  PaymentPropType,
  PropertyManagerPropType,
  PaginationPropType,
  DashboardStatsPropType,
  UserProfilePropType,
  SubscriptionPropType,
  PackagePropType,
  RegionPropType,
  DistrictPropType,
  WardPropType,
  ToastPropType,
  ModalPropType,
  ButtonPropType,
  ChildrenPropType,
};
