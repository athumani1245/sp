import React from 'react';
import { Layout, Typography, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: '24px', padding: 0, color: '#CC5B4B' }}
          >
            Go Back
          </Button>

          <Card 
            style={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <Title level={1} style={{ marginBottom: '8px', fontSize: '36px', fontWeight: 700 }}>
                Privacy Policy for Tanaka
              </Title>
              <Paragraph style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>
                Effective Date: 08th September 2025
              </Paragraph>
            </div>

            <div style={{ lineHeight: '1.8' }}>
              <Paragraph style={{ fontSize: '15px', marginBottom: '40px', color: '#595959' }}>
                Tanaka respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our mobile application ("App") and related services.
              </Paragraph>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  1. Information We Collect
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: '16px', color: '#595959' }}>
                  When you use Tanaka, we may collect the following types of information:
                </Paragraph>
                <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Personal Information:</strong> Such as name, phone number, email address, and payment details (if applicable).
                  </li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Property and Lease Information:</strong> Such as property details, tenant/landlord information, and lease agreements.
                  </li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Device Information:</strong> Such as device type, operating system, and unique identifiers.
                  </li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Usage Data:</strong> Such as interactions with the app, log data, and error reports.
                  </li>
                </ul>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  2. How We Use Information
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: '16px', color: '#595959' }}>
                  We use collected information to:
                </Paragraph>
                <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Provide and improve our services.</li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Facilitate property and rental management between landlords and tenants.</li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Process payments (if applicable).</li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Communicate with you regarding updates, support, or notifications.</li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Ensure security, prevent fraud, and comply with legal obligations.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  3. Sharing of Information
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: '16px', color: '#595959' }}>
                  We do not sell or rent your personal information to third parties.
                </Paragraph>
                <Paragraph style={{ fontSize: '15px', marginBottom: '16px', color: '#595959' }}>
                  We may share information only in the following cases:
                </Paragraph>
                <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Service Providers:</strong> With trusted third parties who help us operate the app (e.g., payment processors, cloud hosting).
                  </li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Legal Requirements:</strong> If required by law, regulation, or valid legal request.
                  </li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.
                  </li>
                </ul>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  4. Data Security
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  We use reasonable administrative, technical, and physical safeguards to protect your data. However, no method of electronic transmission or storage is 100% secure.
                </Paragraph>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  5. Data Retention
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  We retain your information for as long as needed to provide our services or as required by law.
                </Paragraph>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  6. Your Rights
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: '16px', color: '#595959' }}>
                  Depending on your location, you may have rights to:
                </Paragraph>
                <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Access and update your personal information.</li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Request deletion of your data.</li>
                  <li style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>Restrict or object to certain processing.</li>
                </ul>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  You can exercise these rights by contacting us at the details below.
                </Paragraph>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  7. Children's Privacy
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  Tanaka is not directed at children under 18. We do not knowingly collect personal data from children. If we learn that we have done so, we will delete it promptly.
                </Paragraph>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  8. Third-Party Links
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  The app may contain links to third-party websites or services. We are not responsible for their privacy practices.
                </Paragraph>
              </section>

              <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  9. Changes to this Policy
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  We may update this Privacy Policy from time to time. Changes will be posted here with the updated effective date.
                </Paragraph>
              </section>

              <section>
                <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
                  10. Contact Us
                </Title>
                <Paragraph style={{ fontSize: '15px', marginBottom: '8px', color: '#595959' }}>
                  If you have any questions about this Privacy Policy, please contact us:
                </Paragraph>
                <Paragraph style={{ fontSize: '15px', marginBottom: 0, color: '#595959' }}>
                  📧 Email: founder@tanaka.co.tz
                </Paragraph>
              </section>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default PrivacyPolicy;
