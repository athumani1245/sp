import React from 'react';
import { Typography, Divider } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Address {
  region_name?: string;
  district_name?: string;
  ward_name?: string;
  street?: string;
}

interface Property {
  id: string;
  property_name: string;
  property_type?: string;
  address?: Address;
}

interface Unit {
  unit_name?: string;
  unit_number?: string;
}

interface Tenant {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface Lease {
  id: string;
  lease_number: string;
  property?: Property;
  unit?: Unit;
  tenant?: Tenant;
  start_date: string;
  end_date: string;
  number_of_month?: number;
  rent_amount_per_unit?: number;
  total_amount: number;
  discount?: number;
  amount_paid: number;
  status: string;
}

interface LeasePDFDocumentProps {
  lease: Lease;
}

const LeasePDFDocument: React.FC<LeasePDFDocumentProps> = ({ lease }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const getAddress = (address?: Address) => {
    if (!address) return 'N/A';
    const parts = [
      address.street,
      address.ward_name,
      address.district_name,
      address.region_name
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const balance = lease.total_amount - lease.amount_paid;

  return (
    <div
      id="lease-pdf-content"
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.4',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <Title level={2} style={{ margin: 0, color: '#000', fontSize: '20px' }}>
          LEASE AGREEMENT
        </Title>
        <Text style={{ fontSize: '14px', color: '#000' }}>
          Document No: {lease.lease_number}
        </Text>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Parties Section */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={4} style={{ color: '#000', marginBottom: '8px', fontSize: '14px' }}>
          PARTIES TO THE AGREEMENT
        </Title>

        <div style={{ marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>
            LANDLORD (Property Owner):
          </Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            Property Management Company
          </Text>
        </div>

        <div>
          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>
            TENANT:
          </Text>
          <Text style={{ fontSize: '11px', color: '#000', display: 'block' }}>
            Name: {lease.tenant?.first_name && lease.tenant?.last_name
              ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
              : 'N/A'}
          </Text>
          {lease.tenant?.email && (
            <Text style={{ fontSize: '11px', color: '#000', display: 'block' }}>
              Email: {lease.tenant.email}
            </Text>
          )}
          {lease.tenant?.phone && (
            <Text style={{ fontSize: '11px', color: '#000', display: 'block' }}>
              Phone: {lease.tenant.phone}
            </Text>
          )}
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Property Details */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={4} style={{ color: '#000', marginBottom: '8px', fontSize: '14px' }}>
          PROPERTY DETAILS
        </Title>

        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
          <Text strong style={{ fontSize: '11px' }}>Property Name:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {lease.property?.property_name || 'N/A'}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Property Type:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {lease.property?.property_type || 'N/A'}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Unit:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {lease.unit?.unit_name || lease.unit?.unit_number || 'N/A'}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Location:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {getAddress(lease.property?.address)}
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Lease Terms */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={4} style={{ color: '#000', marginBottom: '8px', fontSize: '14px' }}>
          LEASE TERMS
        </Title>

        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
          <Text strong style={{ fontSize: '11px' }}>Start Date:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {formatDate(lease.start_date)}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>End Date:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {formatDate(lease.end_date)}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Duration:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {lease.number_of_month ? `${lease.number_of_month} months` : 'N/A'}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Status:</Text>
          <Text style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase' }}>
            {lease.status}
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Financial Terms */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={4} style={{ color: '#000', marginBottom: '8px', fontSize: '14px' }}>
          FINANCIAL TERMS
        </Title>

        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px' }}>
          <Text strong style={{ fontSize: '11px' }}>Monthly Rent:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {formatCurrency(lease.rent_amount_per_unit || 0)}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Total Amount:</Text>
          <Text strong style={{ fontSize: '11px', color: '#000' }}>
            {formatCurrency(lease.total_amount)}
          </Text>

          {lease.discount && lease.discount > 0 ? (
            <>
              <Text strong style={{ fontSize: '11px' }}>Discount:</Text>
              <Text style={{ fontSize: '11px', color: '#000' }}>
                {formatCurrency(lease.discount)}
              </Text>
            </>
          ) : null}

          <Text strong style={{ fontSize: '11px' }}>Amount Paid:</Text>
          <Text style={{ fontSize: '11px', color: '#000' }}>
            {formatCurrency(lease.amount_paid)}
          </Text>

          <Text strong style={{ fontSize: '11px' }}>Balance Due:</Text>
          <Text 
            strong 
            style={{ 
              fontSize: '11px', 
              color: '#000'
            }}
          >
            {formatCurrency(balance)}
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Terms and Conditions */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={4} style={{ color: '#000', marginBottom: '8px', fontSize: '14px' }}>
          TERMS AND CONDITIONS
        </Title>

        <ol style={{ paddingLeft: '20px', fontSize: '10px', color: '#000', lineHeight: '1.5', margin: 0 }}>
          <li style={{ marginBottom: '3px' }}>
            The tenant agrees to pay the monthly rent on or before the due date specified in this agreement.
          </li>
          <li style={{ marginBottom: '3px' }}>
            The tenant shall use the premises solely for residential purposes and shall not sublet 
            without prior written consent from the landlord.
          </li>
          <li style={{ marginBottom: '3px' }}>
            The tenant is responsible for maintaining the property in good condition and shall report 
            any damages or required repairs to the landlord promptly.
          </li>
          <li style={{ marginBottom: '3px' }}>
            Utilities and other charges not included in the rent shall be paid separately by the tenant.
          </li>
          <li style={{ marginBottom: '3px' }}>
            Either party may terminate this lease by providing written notice at least 30 days in advance.
          </li>
          <li style={{ marginBottom: '3px' }}>
            The tenant shall comply with all applicable laws, regulations, and building rules.
          </li>
        </ol>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Signatures */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '30px' }}>
              <Text strong style={{ fontSize: '11px', display: 'block' }}>
                Landlord Signature
              </Text>
              <Text style={{ fontSize: '10px', color: '#000' }}>
                Date: _______________
              </Text>
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '30px' }}>
              <Text strong style={{ fontSize: '11px', display: 'block' }}>
                Tenant Signature
              </Text>
              <Text style={{ fontSize: '10px', color: '#000' }}>
                Date: _______________
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '15px', textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #000' }}>
        <Text style={{ fontSize: '9px', color: '#000' }}>
          This document is generated electronically and is valid without signature for reference purposes.
        </Text>
        <br />
        <Text style={{ fontSize: '9px', color: '#000' }}>
          Generated on: {dayjs().format('MMM DD, YYYY HH:mm')}
        </Text>
      </div>
    </div>
  );
};

export default LeasePDFDocument;
