import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#333333',
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#333333',
  },
  value: {
    width: '60%',
    color: '#000000',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  terms: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
    borderTop: 1,
    borderTopColor: '#333333',
    paddingTop: 10,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTop: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
});

// Format currency function
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'TSh 0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'TSh 0';
  return `TSh ${numAmount.toLocaleString()}`;
};

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Get unit info
const getUnitInfo = (lease) => {
  if (lease.unit_number) {
    return lease.unit_number;
  } else if (lease.unit_name) {
    return lease.unit_name;
  } else if (lease.unit && lease.unit.unit_name) {
    return lease.unit.unit_name;
  } else if (lease.unit && lease.unit.unit_number) {
    return lease.unit.unit_number;
  }
  return 'Unknown Unit';
};

const LeaseAgreementTemplate = ({ lease }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LEASE AGREEMENT</Text>
        <Text style={styles.subtitle}>Reference: {lease.lease_number || 'N/A'}</Text>
      </View>

      {/* Parties Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PARTIES TO THE AGREEMENT</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Landlord/Lessor:</Text>
          <Text style={styles.value}>Property Management Company</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Tenant/Lessee:</Text>
          <Text style={styles.value}>
            {lease.tenant && (lease.tenant.first_name || lease.tenant.last_name) 
              ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
              : lease.tenant?.username || 'Unknown Tenant'}
          </Text>
        </View>

        {lease.tenant?.email && (
          <View style={styles.row}>
            <Text style={styles.label}>Tenant Email:</Text>
            <Text style={styles.value}>{lease.tenant.email}</Text>
          </View>
        )}

        {lease.tenant?.phone && (
          <View style={styles.row}>
            <Text style={styles.label}>Tenant Phone:</Text>
            <Text style={styles.value}>{lease.tenant.phone}</Text>
          </View>
        )}
      </View>

      {/* Property Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROPERTY INFORMATION</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Property Name:</Text>
          <Text style={styles.value}>{lease.property?.property_name || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Unit:</Text>
          <Text style={styles.value}>{getUnitInfo(lease)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Property Type:</Text>
          <Text style={styles.value}>{lease.property?.property_type || 'N/A'}</Text>
        </View>

        {lease.property?.address && (
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {`${lease.property.address.street || ''}, ${lease.property.address.region_name || ''} ${lease.property.address.district_name || ''}, ${lease.property.address.ward_name || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')}
            </Text>
          </View>
        )}
      </View>

      {/* Lease Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEASE TERMS</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Lease Start Date:</Text>
          <Text style={styles.value}>{formatDate(lease.start_date)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Lease End Date:</Text>
          <Text style={styles.value}>{formatDate(lease.end_date)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Lease Duration:</Text>
          <Text style={styles.value}>{lease.number_of_month || 0} months</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Monthly Rent:</Text>
          <Text style={styles.value}>{formatCurrency(lease.rent_amount_per_unit || lease.monthly_rent)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Total Lease Amount:</Text>
          <Text style={styles.value}>{formatCurrency(lease.total_amount)}</Text>
        </View>

        {lease.discount && lease.discount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Discount Applied:</Text>
            <Text style={styles.value}>{formatCurrency(lease.discount)}</Text>
          </View>
        )}
        
        <View style={styles.row}>
          <Text style={styles.label}>Security Deposit:</Text>
          <Text style={styles.value}>{formatCurrency(lease.security_deposit || 0)}</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PAYMENT INFORMATION</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Amount Paid:</Text>
          <Text style={styles.value}>{formatCurrency(lease.amount_paid || 0)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Remaining Balance:</Text>
          <Text style={styles.value}>{formatCurrency(lease.remaining_amount || 0)}</Text>
        </View>

        {lease.over_paid_amount && lease.over_paid_amount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Overpaid Amount:</Text>
            <Text style={styles.value}>{formatCurrency(lease.over_paid_amount)}</Text>
          </View>
        )}
        
        <View style={styles.row}>
          <Text style={styles.label}>Lease Status:</Text>
          <Text style={styles.value}>{(lease.status || 'unknown').charAt(0).toUpperCase() + (lease.status || 'unknown').slice(1)}</Text>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TERMS AND CONDITIONS</Text>
        
        <Text style={styles.terms}>
          1. The tenant agrees to pay rent monthly in advance on or before the 1st day of each month.
        </Text>
        <Text style={styles.terms}>
          2. The tenant shall maintain the property in good condition and report any damages immediately.
        </Text>
        <Text style={styles.terms}>
          3. The landlord reserves the right to inspect the property with 24 hours notice.
        </Text>
        <Text style={styles.terms}>
          4. Any modifications to the property must be approved by the landlord in writing.
        </Text>
        <Text style={styles.terms}>
          5. The tenant is responsible for utilities unless otherwise specified in this agreement.
        </Text>
        <Text style={styles.terms}>
          6. This lease is binding upon both parties and their successors or assigns.
        </Text>
      </View>

      {/* Agreement Text */}
      <View style={styles.section}>
        <Text style={styles.paragraph}>
          This lease agreement is entered into on {formatDate(lease.created_at || lease.start_date)} between the Landlord and Tenant as described above. 
          Both parties agree to the terms and conditions outlined in this document and commit to fulfilling their respective obligations.
        </Text>
      </View>

      {/* Signatures */}
      <View style={styles.signature}>
        <View style={styles.signatureBlock}>
          <Text>Landlord Signature</Text>
          <Text>Date: _____________</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text>Tenant Signature</Text>
          <Text>Date: _____________</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated by Property Management System on {formatDate(new Date().toISOString())}</Text>
        <Text>This document is computer generated and legally binding.</Text>
      </View>
    </Page>
  </Document>
);

export default LeaseAgreementTemplate;