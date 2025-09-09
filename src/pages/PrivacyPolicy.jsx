import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../assets/styles/privacy-policy.css';

const PrivacyPolicy = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="privacy-header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-brand">Tanaka</div>
            <Link to="/" className="nav-link">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-grow-1 d-flex align-items-start justify-content-center">
        <Container className="my-4">
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>

              <div className="privacy-card">
                <div className="text-center mb-4">
                  <img 
                    src="/Logo.png" 
                    alt="Tanaka Logo" 
                    className="mb-3"
                    style={{ width: "64px", height: "64px" }}
                  />
                  <h2 className="card-title mb-3">Privacy Policy for Tanaka</h2>
                  <p className="text-muted mb-2" style={{ textAlign: 'left' }}>Effective Date: 08th September 2025</p>
                  <p className="text-muted" style={{ textAlign: 'justify' }}>
                    Tanaka respects your privacy and is committed to protecting your personal information. 
                    This Privacy Policy explains how we collect, use, and share information when you use 
                    our mobile application ("App") and related services.
                  </p>
                </div>

                <div className="privacy-content">
                  <section className="mb-5">
                    <h3 className="section-title">1. Information We Collect</h3>
                    <p className="mb-3" style={{ textAlign: 'justify' }}>When you use Tanaka, we may collect the following types of information:</p>
                    <ul className="privacy-list">
                      <li><strong>Personal Information:</strong> Such as name, phone number, email address, and payment details (if applicable).</li>
                      <li><strong>Property and Lease Information:</strong> Such as property details, tenant/landlord information, and lease agreements.</li>
                      <li><strong>Device Information:</strong> Such as device type, operating system, and unique identifiers.</li>
                      <li><strong>Usage Data:</strong> Such as interactions with the app, log data, and error reports.</li>
                    </ul>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">2. How We Use Information</h3>
                    <p className="mb-3" style={{ textAlign: 'justify' }}>We use collected information to:</p>
                    <ul className="privacy-list">
                      <li>Provide and improve our services.</li>
                      <li>Facilitate property and rental management between landlords and tenants.</li>
                      <li>Process payments (if applicable).</li>
                      <li>Communicate with you regarding updates, support, or notifications.</li>
                      <li>Ensure security, prevent fraud, and comply with legal obligations.</li>
                    </ul>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">3. Sharing of Information</h3>
                    <p className="mb-3" style={{ textAlign: 'justify' }}>We do not sell or rent your personal information to third parties.</p>
                    <p className="mb-3" style={{ textAlign: 'justify' }}>We may share information only in the following cases:</p>
                    <ul className="privacy-list">
                      <li><strong>Service Providers:</strong> With trusted third parties who help us operate the app (e.g., payment processors, cloud hosting).</li>
                      <li><strong>Legal Requirements:</strong> If required by law, regulation, or valid legal request.</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                    </ul>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">4. Data Security</h3>
                    <p style={{ textAlign: 'justify' }}>
                      We use reasonable administrative, technical, and physical safeguards to protect your data. 
                      However, no method of electronic transmission or storage is 100% secure.
                    </p>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">5. Data Retention</h3>
                    <p style={{ textAlign: 'justify' }}>
                      We retain your information for as long as needed to provide our services or as required by law.
                    </p>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">6. Your Rights</h3>
                    <p className="mb-3" style={{ textAlign: 'justify' }}>Depending on your location, you may have rights to:</p>
                    <ul className="privacy-list">
                      <li>Access and update your personal information.</li>
                      <li>Request deletion of your data.</li>
                      <li>Restrict or object to certain processing.</li>
                    </ul>
                    <p style={{ textAlign: 'justify' }}>You can exercise these rights by contacting us at the details below.</p>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">7. Children's Privacy</h3>
                    <p style={{ textAlign: 'justify' }}>
                      Tanaka is not directed at children under 18. We do not knowingly collect personal data 
                      from children. If we learn that we have done so, we will delete it promptly.
                    </p>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">8. Third-Party Links</h3>
                    <p style={{ textAlign: 'justify' }}>
                      The app may contain links to third-party websites or services. We are not responsible 
                      for their privacy practices.
                    </p>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">9. Changes to this Policy</h3>
                    <p style={{ textAlign: 'justify' }}>
                      We may update this Privacy Policy from time to time. Changes will be posted here 
                      with the updated effective date.
                    </p>
                  </section>

                  <section className="mb-5">
                    <h3 className="section-title">10. Contact Us</h3>
                    <p className="mb-3" style={{ textAlign: 'justify' }}>If you have any questions about this Privacy Policy, please contact us:</p>
                    <div className="contact-info">
                      <p className="mb-0">
                        <i className="fas fa-envelope text-primary me-2"></i>
                        <strong>Email:</strong> <a href="mailto:founder@tanaka.co.tz" className="text-primary">founder@tanaka.co.tz</a>
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <footer className="py-4 text-center">
        <div className="text-muted small">
          &copy; {new Date().getFullYear()} Tanaka. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;