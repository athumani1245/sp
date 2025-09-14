import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/landing.css";

function Landing() {
    const navigate = useNavigate();

    const features = [
        {
            icon: "bi-house-door",
            title: "Property Management",
            description: "Manage multiple properties with ease. Track units, tenants, and maintenance all in one place."
        },
        {
            icon: "bi-people",
            title: "Tenant Management",
            description: "Keep detailed tenant records, track lease agreements, and manage communications effortlessly."
        },
        {
            icon: "bi-calendar-check",
            title: "Lease Tracking",
            description: "Monitor lease terms, renewal dates, and rental agreements with automated reminders."
        },
        {
            icon: "bi-credit-card",
            title: "Payment Tracking",
            description: "Track rent payments, late fees, and generate financial reports with our integrated system."
        },
        {
            icon: "bi-tools",
            title: "Maintenance Requests",
            description: "Handle maintenance requests efficiently with our ticketing system and vendor management."
        },
        {
            icon: "bi-graph-up",
            title: "Analytics & Reports",
            description: "Get insights into your property performance with detailed analytics and custom reports."
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Property Owner",
            text: "Tanaka has revolutionized how I manage my rental properties. Everything is so much easier now!",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Real Estate Investor",
            text: "The best property management platform I've used. Saves me hours every week.",
            rating: 5
        },
        {
            name: "Emily Davis",
            role: "Property Manager",
            text: "Outstanding features and excellent customer support. Highly recommended!",
            rating: 5
        }
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
                <div className="container">
                    <a className="navbar-brand" href="#home">
                        <img src="/Logo.png" alt="Tanaka" width="40" height="40" className="me-2" />
                        <span className="brand-name">Tanaka</span>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#features">Features</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#pricing">Pricing</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#about">About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#testimonials">Testimonials</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#contact">Contact</a>
                            </li>
                            <li className="nav-item ms-2">
                                <button 
                                    className="btn btn-outline-primary me-2"
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate("/register")}
                                >
                                    Get Started
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="container">
                    <div className="row align-items-center min-vh-100">
                        <div className="col-lg-6">
                            <div className="hero-content">
                                <h1 className="hero-title">
                                    Rent & Manage with <span className="text-primary">Ease</span>
                                </h1>
                                <p className="hero-description">
                                    Streamline your property management with Tanaka's comprehensive platform. 
                                    From tenant screening to rent collection, we've got you covered.
                                </p>
                                <div className="hero-buttons">
                                    <button 
                                        className="btn btn-primary btn-lg me-3"
                                        onClick={() => navigate("/register")}
                                    >
                                        Start Free Trial
                                    </button>
                                    <button 
                                        className="btn btn-outline-primary btn-lg"
                                        onClick={() => navigate("/login")}
                                    >
                                        Sign In
                                    </button>
                                </div>
                                <div className="hero-stats">
                                    <div className="stat-item">
                                        <h4>1000+</h4>
                                        <p>Properties Managed</p>
                                    </div>
                                    <div className="stat-item">
                                        <h4>5000+</h4>
                                        <p>Happy Tenants</p>
                                    </div>
                                    <div className="stat-item">
                                        <h4>99.9%</h4>
                                        <p>Uptime</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="hero-image">
                                <div className="hero-card">
                                    <div className="card-header">
                                        <h5>Property Dashboard</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="metric">
                                            <span className="metric-label">Total Properties</span>
                                            <span className="metric-value">12</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Occupied Units</span>
                                            <span className="metric-value text-success">45/48</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Monthly Revenue</span>
                                            <span className="metric-value">TZS 2,450,000</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Outstanding</span>
                                            <span className="metric-value text-warning">TZS 120,000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Powerful Features</h2>
                        <p className="section-description">
                            Everything you need to manage your properties efficiently
                        </p>
                    </div>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className={`bi ${feature.icon}`}></i>
                                    </div>
                                    <h4 className="feature-title">{feature.title}</h4>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Choose Your Plan</h2>
                        <p className="section-description">
                            Select the perfect plan for your property management needs. 
                            Start with our free trial and upgrade as you grow.
                        </p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {/* Starter Plan */}
                        <div className="col-lg-4 col-md-6">
                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h4 className="plan-name">Starter</h4>
                                    <p className="plan-description">Perfect for individual landlords</p>
                                </div>
                                <div className="pricing-price">
                                    <span className="currency">TZS</span>
                                    <span className="amount">15,000</span>
                                    <span className="period">/month</span>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="bi bi-check-circle-fill"></i>Up to 5 properties</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Basic tenant management</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Payment tracking</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Monthly reports</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Email support</li>
                                </ul>
                                <button 
                                    className="btn btn-outline-primary w-100"
                                    onClick={() => navigate("/register")}
                                >
                                    Start Free Trial
                                </button>
                            </div>
                        </div>

                        {/* Professional Plan - Popular */}
                        <div className="col-lg-4 col-md-6">
                            <div className="pricing-card featured">
                                <div className="popular-badge">Most Popular</div>
                                <div className="pricing-header">
                                    <h4 className="plan-name">Professional</h4>
                                    <p className="plan-description">Best for growing portfolios</p>
                                </div>
                                <div className="pricing-price">
                                    <span className="currency">TZS</span>
                                    <span className="amount">35,000</span>
                                    <span className="period">/month</span>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="bi bi-check-circle-fill"></i>Up to 25 properties</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Advanced tenant management</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Automated payment reminders</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Maintenance request system</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Financial analytics</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Priority support</li>
                                </ul>
                                <button 
                                    className="btn btn-primary w-100"
                                    onClick={() => navigate("/register")}
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="col-lg-4 col-md-6">
                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h4 className="plan-name">Enterprise</h4>
                                    <p className="plan-description">For large property managers</p>
                                </div>
                                <div className="pricing-price">
                                    <span className="currency">TZS</span>
                                    <span className="amount">75,000</span>
                                    <span className="period">/month</span>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="bi bi-check-circle-fill"></i>Unlimited properties</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Multi-user access</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Custom integrations</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Advanced reporting</li>
                                    <li><i className="bi bi-check-circle-fill"></i>White-label options</li>
                                    <li><i className="bi bi-check-circle-fill"></i>24/7 phone support</li>
                                </ul>
                                <button 
                                    className="btn btn-outline-primary w-100"
                                    onClick={() => navigate("/register")}
                                >
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FAQ or Additional Info */}
                    <div className="text-center mt-5">
                        <p className="pricing-note">
                            <i className="bi bi-shield-check text-primary me-2"></i>
                            All plans include a 14-day free trial. No credit card required.
                        </p>
                        <p className="pricing-note">
                            <i className="bi bi-headset text-primary me-2"></i>
                            Need a custom plan? <a href="#contact" className="text-primary">Contact our sales team</a>
                        </p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="about-content">
                                <h2 className="section-title">Why Choose Tanaka?</h2>
                                <p className="section-description">
                                    We understand the challenges of property management in Tanzania. 
                                    That's why we've built a platform specifically designed for local needs.
                                </p>
                                <div className="about-features">
                                    <div className="about-feature">
                                        <i className="bi bi-check-circle text-success"></i>
                                        <span>Local currency and payment methods</span>
                                    </div>
                                    <div className="about-feature">
                                        <i className="bi bi-check-circle text-success"></i>
                                        <span>Swahili and English language support</span>
                                    </div>
                                    <div className="about-feature">
                                        <i className="bi bi-check-circle text-success"></i>
                                        <span>Mobile-first design for accessibility</span>
                                    </div>
                                    <div className="about-feature">
                                        <i className="bi bi-check-circle text-success"></i>
                                        <span>24/7 customer support</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-image">
                                <div className="about-card">
                                    <h5>Recent Activity</h5>
                                    <div className="activity-item">
                                        <i className="bi bi-person-plus text-primary"></i>
                                        <span>New tenant registered: John Mwamba</span>
                                    </div>
                                    <div className="activity-item">
                                        <i className="bi bi-credit-card text-success"></i>
                                        <span>Payment received: TZS 450,000</span>
                                    </div>
                                    <div className="activity-item">
                                        <i className="bi bi-tools text-warning"></i>
                                        <span>Maintenance request submitted</span>
                                    </div>
                                    <div className="activity-item">
                                        <i className="bi bi-file-text text-info"></i>
                                        <span>Lease agreement renewed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">What Our Users Say</h2>
                        <p className="section-description">
                            Join thousands of satisfied property managers and owners
                        </p>
                    </div>
                    <div className="row g-4">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="col-lg-4">
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <i key={i} className="bi bi-star-fill text-warning"></i>
                                        ))}
                                    </div>
                                    <p className="testimonial-text">"{testimonial.text}"</p>
                                    <div className="testimonial-author">
                                        <h6>{testimonial.name}</h6>
                                        <small>{testimonial.role}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="text-center">
                        <h2 className="cta-title">Ready to Get Started?</h2>
                        <p className="cta-description">
                            Join thousands of property managers who trust Tanaka for their business
                        </p>
                        <div className="cta-buttons">
                            <button 
                                className="btn btn-primary btn-lg me-3"
                                onClick={() => navigate("/register")}
                            >
                                Start Free Trial
                            </button>
                            <button 
                                className="btn btn-outline-light btn-lg"
                                onClick={() => navigate("/login")}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="footer">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-md-6">
                            <div className="footer-brand">
                                <img src="/Logo.png" alt="Tanaka" width="40" height="40" className="me-2" />
                                <span className="brand-name">Tanaka</span>
                            </div>
                            <p className="footer-description">
                                Streamlining property management across Tanzania with innovative solutions.
                            </p>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <h6 className="footer-title">Contact Us</h6>
                            <div className="footer-contact">
                                <div className="contact-item">
                                    <i className="bi bi-envelope-fill"></i>
                                    <div className="contact-details">
                                        <p><a href="mailto:info@tanaka.co.tz">info@tanaka.co.tz</a></p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="bi bi-telephone-fill"></i>
                                    <div className="contact-details">
                                        <p><a href="tel:+255712345678">+255 762 357 820</a></p>
                                        <p><a href="tel:+255787654321">+255 718 646 545</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title">Product</h6>
                            <ul className="footer-links">
                                <li><a href="#features">Features</a></li>
                                <li><a href="#pricing">Pricing</a></li>
                                <li><a href="#integrations">Integrations</a></li>
                                <li><a href="#api">API</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title">Support</h6>
                            <ul className="footer-links">
                                <li><a href="#help">Help Center</a></li>
                                <li><a href="#contact">Contact</a></li>
                                <li><a href="#status">Status</a></li>
                                <li><a href="#security">Security</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title">Legal</h6>
                            <ul className="footer-links">
                                <li><a href="/privacy-policy">Privacy</a></li>
                                <li><a href="#terms">Terms</a></li>
                                <li><a href="#cookies">Cookies</a></li>
                                <li><a href="#licenses">Licenses</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr className="footer-divider" />
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <p className="footer-copyright">
                                &copy; {new Date().getFullYear()} Tanaka. All rights reserved.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="footer-social">
                                <a href="#" className="social-link">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href="#" className="social-link">
                                    <i className="bi bi-twitter"></i>
                                </a>
                                <a href="https://www.linkedin.com/company/tanakas" className="social-link">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                                <a href="https://www.instagram.com/tanakatanzania" className="social-link">
                                    <i className="bi bi-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;