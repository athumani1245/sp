import React, { useRef } from 'react';
import { Modal, Button, Space, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, EyeOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LeasePDFDocument from './LeasePDFDocument';

interface Lease {
  id: string;
  lease_number: string;
  property?: any;
  unit?: any;
  tenant?: any;
  start_date: string;
  end_date: string;
  number_of_month?: number;
  rent_amount_per_unit?: number;
  total_amount: number;
  discount?: number;
  amount_paid: number;
  status: string;
}

interface LeasePDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  lease: Lease;
}

const LeasePDFPreviewModal: React.FC<LeasePDFPreviewModalProps> = ({
  open,
  onClose,
  lease,
}) => {
  const [generating, setGenerating] = React.useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (action: 'download' | 'print') => {
    if (!contentRef.current) return;

    setGenerating(true);
    message.loading({ content: 'Generating PDF...', key: 'pdf-gen' });

    try {
      // Capture the content as canvas
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      } as any);

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      message.success({ content: 'PDF generated successfully!', key: 'pdf-gen' });

      if (action === 'download') {
        // Download PDF
        pdf.save(`Lease_${lease.lease_number}_${new Date().getTime()}.pdf`);
      } else if (action === 'print') {
        // Open print dialog
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            printWindow.print();
          });
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error({ content: 'Failed to generate PDF', key: 'pdf-gen' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <EyeOutlined />
          Lease Agreement Preview - {lease.lease_number}
        </Space>
      }
      width={900}
      footer={
        <Space>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="default"
            icon={<PrinterOutlined />}
            onClick={() => generatePDF('print')}
            loading={generating}
          >
            Print
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => generatePDF('download')}
            loading={generating}
            style={{ backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' }}
          >
            Download PDF
          </Button>
        </Space>
      }
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <div ref={contentRef}>
        <LeasePDFDocument lease={lease} />
      </div>
    </Modal>
  );
};

export default LeasePDFPreviewModal;
