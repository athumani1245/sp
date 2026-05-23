import type { LeaseVariable } from '../services/leaseTemplateService';

export const LEASE_VARIABLES: LeaseVariable[] = [
  // Lease
  { id: 'lease_number',               label: 'Lease Number',          category: 'Lease' },
  { id: 'lease_status',               label: 'Lease Status',          category: 'Lease' },
  { id: 'lease_start_date',           label: 'Lease Start Date',      category: 'Lease' },
  { id: 'lease_end_date',             label: 'Lease End Date',        category: 'Lease' },
  { id: 'number_of_months',           label: 'Number of Months',      category: 'Lease' },
  { id: 'rent_amount',                label: 'Rent Amount',           category: 'Lease' },
  { id: 'total_amount',               label: 'Total Amount',          category: 'Lease' },
  { id: 'amount_paid',                label: 'Amount Paid',           category: 'Lease' },
  { id: 'discount',                   label: 'Discount',              category: 'Lease' },
  { id: 'remaining_amount',           label: 'Remaining Amount',      category: 'Lease' },
  { id: 'over_paid_amount',           label: 'Over Paid Amount',      category: 'Lease' },
  // Tenant
  { id: 'tenant_name',                label: 'Tenant Full Name',      category: 'Tenant' },
  { id: 'tenant_first_name',          label: 'Tenant First Name',     category: 'Tenant' },
  { id: 'tenant_last_name',           label: 'Tenant Last Name',      category: 'Tenant' },
  { id: 'tenant_phone',               label: 'Tenant Phone',          category: 'Tenant' },
  { id: 'tenant_email',               label: 'Tenant Email',          category: 'Tenant' },
  { id: 'tenant_gender',              label: 'Tenant Gender',         category: 'Tenant' },
  { id: 'tenant_identification',      label: 'Tenant ID / Passport',  category: 'Tenant' },
  // Landlord
  { id: 'landlord_name',              label: 'Landlord Full Name',    category: 'Landlord' },
  { id: 'landlord_first_name',        label: 'Landlord First Name',   category: 'Landlord' },
  { id: 'landlord_last_name',         label: 'Landlord Last Name',    category: 'Landlord' },
  { id: 'landlord_phone',             label: 'Landlord Phone',        category: 'Landlord' },
  { id: 'landlord_email',             label: 'Landlord Email',        category: 'Landlord' },
  { id: 'landlord_address',           label: 'Landlord Address',      category: 'Landlord' },
  // Payment accounts
  { id: 'payment_account_1_provider', label: 'Account 1 Provider',   category: 'Payment Accounts' },
  { id: 'payment_account_1_number',   label: 'Account 1 Number',     category: 'Payment Accounts' },
  { id: 'payment_account_1_name',     label: 'Account 1 Name',       category: 'Payment Accounts' },
  { id: 'payment_account_2_provider', label: 'Account 2 Provider',   category: 'Payment Accounts' },
  { id: 'payment_account_2_number',   label: 'Account 2 Number',     category: 'Payment Accounts' },
  { id: 'payment_account_2_name',     label: 'Account 2 Name',       category: 'Payment Accounts' },
  // Property
  { id: 'property_name',              label: 'Property Name',         category: 'Property' },
  { id: 'property_type',              label: 'Property Type',         category: 'Property' },
  { id: 'property_address',           label: 'Property Full Address', category: 'Property' },
  { id: 'property_street',            label: 'Property Street',       category: 'Property' },
  { id: 'property_ward',              label: 'Property Ward',         category: 'Property' },
  { id: 'property_district',          label: 'Property District',     category: 'Property' },
  { id: 'property_region',            label: 'Property Region',       category: 'Property' },
  // Unit
  { id: 'unit_name',                  label: 'Unit Name',             category: 'Unit' },
  { id: 'unit_rent_per_month',        label: 'Unit Rent Per Month',   category: 'Unit' },
  // Payment history
  { id: 'payment_date',               label: 'Last Payment Date',     category: 'Payment' },
  { id: 'payment_amount',             label: 'Last Payment Amount',   category: 'Payment' },
  { id: 'payment_method',             label: 'Payment Method',        category: 'Payment' },
  { id: 'payment_status',             label: 'Payment Status',        category: 'Payment' },
  { id: 'payment_description',        label: 'Payment Description',   category: 'Payment' },
];

export const VARIABLE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  LEASE_VARIABLES.map((v) => [v.id, v.label]),
);
