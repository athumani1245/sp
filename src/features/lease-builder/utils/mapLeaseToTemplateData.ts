function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // DD-MM-YYYY
      if (parts[0].length <= 2 && parts[2].length === 4) {
        const [day, month, year] = parts;
        const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(d.getTime())) return d.toLocaleDateString();
      }
      // YYYY-MM-DD
      if (parts[0].length === 4) {
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) return d.toLocaleDateString();
      }
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString();
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: number | string | null | undefined): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (n == null || isNaN(n as number)) return '';
  return `TSh ${(n as number).toLocaleString()}`;
}

function fullName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(' ');
}

export function mapLeaseToTemplateData(lease: any): Record<string, string> {
  const tenant    = lease?.tenant    || {};
  const property  = lease?.property  || {};
  const unit      = lease?.unit      || {};
  const landlord  = lease?.landlord  || {};
  const address   = property?.address || {};
  const payments  = Array.isArray(lease?.payments) ? lease.payments : [];
  const accounts  = Array.isArray(landlord?.payment_account) ? landlord.payment_account : [];

  // ── Tenant ────────────────────────────────────────────────────────────────
  const tenantName = fullName(tenant.first_name, tenant.last_name);

  // ── Landlord ──────────────────────────────────────────────────────────────
  const landlordName = fullName(landlord.first_name, landlord.last_name);

  // ── Property address ──────────────────────────────────────────────────────
  const propertyAddress = [
    address.street,
    address.ward_name,
    address.district_name,
    address.region_name,
  ].filter(Boolean).join(', ');

  // ── Payment accounts (up to 3) ────────────────────────────────────────────
  const accountEntries: Record<string, string> = {};
  accounts.slice(0, 3).forEach((acc: any, i: number) => {
    const n = i + 1;
    accountEntries[`payment_account_${n}_provider`] = acc.provider || '';
    accountEntries[`payment_account_${n}_number`]   = acc.payment_number || '';
    accountEntries[`payment_account_${n}_name`]     = acc.account_name || '';
    accountEntries[`payment_account_${n}_type`]     = acc.provider_type || '';
  });

  // ── Most recent / first payment ───────────────────────────────────────────
  const firstPayment = payments[0] || {};

  return {
    // ── Lease ────────────────────────────────────────────────────────────────
    lease_number:          lease?.lease_number       || '',
    lease_status:          lease?.status             || '',
    number_of_months:      lease?.number_of_month    ? String(lease.number_of_month) : '',
    lease_start_date:      formatDate(lease?.start_date),
    lease_end_date:        formatDate(lease?.end_date),
    rent_amount:           formatCurrency(lease?.rent_amount_per_unit),
    total_amount:          formatCurrency(lease?.total_amount),
    amount_paid:           formatCurrency(lease?.amount_paid),
    discount:              formatCurrency(lease?.discount),
    remaining_amount:      formatCurrency(lease?.remaining_amount),
    over_paid_amount:      formatCurrency(lease?.over_paid_amount),

    // ── Tenant ───────────────────────────────────────────────────────────────
    tenant_name:           tenantName,
    tenant_first_name:     tenant.first_name         || '',
    tenant_last_name:      tenant.last_name          || '',
    tenant_phone:          tenant.username           || tenant.phone || '',
    tenant_email:          tenant.email              || '',
    tenant_gender:         tenant.gender             || '',
    tenant_identification: tenant.identification     || '',

    // ── Landlord ─────────────────────────────────────────────────────────────
    landlord_name:         landlordName,
    landlord_first_name:   landlord.first_name       || '',
    landlord_last_name:    landlord.last_name        || '',
    landlord_phone:        landlord.phone_number     || '',
    landlord_email:        landlord.email            || '',
    landlord_address:      landlord.address          || '',

    // ── Payment accounts ─────────────────────────────────────────────────────
    ...accountEntries,

    // ── Property ─────────────────────────────────────────────────────────────
    property_name:         property.property_name    || '',
    property_type:         property.property_type    || '',
    property_address:      propertyAddress,
    property_street:       address.street            || '',
    property_ward:         address.ward_name         || '',
    property_district:     address.district_name     || '',
    property_region:       address.region_name       || '',

    // ── Unit ─────────────────────────────────────────────────────────────────
    unit_name:             unit.unit_name            || (unit.unit_number ? `Unit ${unit.unit_number}` : ''),
    unit_rent_per_month:   formatCurrency(unit.rent_per_month),

    // ── Last / first payment ─────────────────────────────────────────────────
    payment_date:          formatDate(firstPayment.date_paid),
    payment_amount:        formatCurrency(firstPayment.amount_paid),
    payment_method:        firstPayment.payment_source || '',
    payment_status:        firstPayment.status       || '',
    payment_description:   firstPayment.description  || '',
  };
}
