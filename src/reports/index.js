import React from 'react';

// Templates
export { default as LeaseAgreementTemplate } from './templates/LeaseAgreementTemplate.jsx';
export { default as LeaseReportTemplate } from './templates/LeaseReportTemplate.jsx';
export { default as OutstandingPaymentsReportTemplate } from './templates/OutstandingPaymentsReportTemplate.jsx';
export { default as PropertyPerformanceReportTemplate } from './templates/PropertyPerformanceReportTemplate.jsx';

// Utils
export {
  generateAndDownloadPDF,
  generatePDFBlob,
  generatePDFBuffer,
  previewPDF
} from './utils/pdfGenerator.js';

// Report types enum
export const REPORT_TYPES = {
  LEASE_AGREEMENT: 'lease_agreement',
  PAYMENT_RECEIPT: 'payment_receipt',
  TENANT_REPORT: 'tenant_report',
  PROPERTY_REPORT: 'property_report'
};

// Convenience function for lease agreement generation
export const generateLeaseAgreementPDF = async (leaseData, options = {}) => {
  try {
    // Validate lease data
    if (!leaseData) {
      throw new Error('Lease data is required');
    }

    const { 
      download = true, 
      preview = false,
      filename 
    } = options;
    
    const LeaseAgreementTemplate = await import('./templates/LeaseAgreementTemplate.jsx').then(m => m.default);
    const { generateAndDownloadPDF, previewPDF } = await import('./utils/pdfGenerator.js');
    
    const defaultFilename = `lease-agreement-${leaseData.lease_number || leaseData.id || 'unknown'}.pdf`;
    
    if (preview) {
      return previewPDF(<LeaseAgreementTemplate lease={leaseData} />, leaseData);
    }
    
    if (download) {
      return generateAndDownloadPDF(
        <LeaseAgreementTemplate lease={leaseData} />, 
        leaseData, 
        filename || defaultFilename
      );
    }
  } catch (error) {
    console.error('Error generating lease agreement PDF:', error);
    throw error;
  }
};