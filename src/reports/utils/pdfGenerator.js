import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

/**
 * Generate and download a PDF document
 * @param {React.Component} DocumentComponent - The React PDF component to render
 * @param {Object} data - Data to pass to the document component
 * @param {string} filename - Name of the file to download
 */
export const generateAndDownloadPDF = async (DocumentComponent, data, filename) => {
  try {
    // Generate the PDF blob
    const blob = await pdf(DocumentComponent).toBlob();
    
    // Download the file
    saveAs(blob, filename);
    
    return {
      success: true,
      message: 'PDF generated and download started successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate PDF'
    };
  }
};

/**
 * Generate PDF blob without downloading (useful for preview or email)
 * @param {React.Component} DocumentComponent - The React PDF component to render
 * @param {Object} data - Data to pass to the document component
 * @returns {Promise<Blob>} PDF blob
 */
export const generatePDFBlob = async (DocumentComponent, data) => {
  try {
    const blob = await pdf(DocumentComponent).toBlob();
    return {
      success: true,
      blob: blob
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate PDF blob'
    };
  }
};

/**
 * Generate PDF buffer (useful for server-side operations)
 * @param {React.Component} DocumentComponent - The React PDF component to render
 * @param {Object} data - Data to pass to the document component
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generatePDFBuffer = async (DocumentComponent, data) => {
  try {
    const buffer = await pdf(DocumentComponent).toBuffer();
    return {
      success: true,
      buffer: buffer
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate PDF buffer'
    };
  }
};

/**
 * Preview PDF in browser (opens in new tab)
 * @param {React.Component} DocumentComponent - The React PDF component to render
 * @param {Object} data - Data to pass to the document component
 */
export const previewPDF = async (DocumentComponent, data) => {
  try {
    const blob = await pdf(DocumentComponent).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the URL after some time
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
    
    return {
      success: true,
      message: 'PDF preview opened in new tab'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to preview PDF'
    };
  }
};