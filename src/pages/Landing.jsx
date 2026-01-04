import React from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { usePageTitle } from "../hooks/usePageTitle";
import "../assets/styles/landing.css";

function Landing() {
    usePageTitle('Home');
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

    // Structured data for the landing page
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Tanaka Property Management - Professional Property Management System in Tanzania",
        "description": "Transform your property management in Tanzania with Tanaka. Streamline rent collection, tenant management, lease tracking, and financial reporting. Start your free trial today!",
        "url": "https://tanaka.co.tz",
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "Tanaka Property Management",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "15000",
                "priceCurrency": "TZS",
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
            }
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://tanaka.co.tz"
            }]
        }
    };

    return (
        <div className="landing-page">
            <SEOHead 
                title="Tanaka - Professional Property Management System in Tanzania | Rent Collection & Tenant Management"
                description="Transform your property management in Tanzania with Tanaka. Streamline rent collection, tenant management, lease tracking, and financial reporting. Start your free trial today!"
                keywords="property management Tanzania, rent collection software, tenant management system, lease tracking, property management dashboard, TZS payments, rental property management, real estate software Tanzania, property analytics, maintenance management, Dar es Salaam property management"
                url="/"
                structuredData={structuredData}
            />
            {/* Navigation */}
            <header>
                <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top" role="navigation" aria-label="Main navigation">
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
                                <div className="d-flex gap-2 flex-nowrap">
                                    <button 
                                        className="odoo-btn odoo-btn-outline-primary"
                                        onClick={() => navigate("/login")}
                                    >
                                        Login
                                    </button>
                                    <button 
                                        className="odoo-btn odoo-btn-primary"
                                        onClick={() => navigate("/register")}
                                    >
                                        Get Started
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main id="main-content">
                <section id="home" className="hero-section" aria-labelledby="hero-title">
                <div className="container">
                    <div className="row align-items-center min-vh-100">
                        <div className="col-lg-6">
                            <div className="hero-content">
                                <h1 id="hero-title" className="hero-title">
                                    Rent & Manage with <span className="text-primary">Ease</span>
                                </h1>
                                <p className="hero-description">
                                    Streamline your property management with Tanaka's comprehensive platform. 
                                    From tenant screening to rent collection, we've got you covered.
                                </p>
                                <div className="hero-buttons d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                                    <button 
                                        className="odoo-btn odoo-btn-primary odoo-btn-lg"
                                        onClick={() => navigate("/register")}
                                    >
                                        Start Free Trial
                                    </button>
                                    <button 
                                        className="odoo-btn odoo-btn-outline-primary odoo-btn-lg"
                                        onClick={() => navigate("/login")}
                                    >
                                        Sign In
                                    </button>
                                </div>
                                <div className="hero-stats">
                                    <div className="stat-item">
                                        <h4>50+</h4>
                                        <p>Properties Managed</p>
                                    </div>
                                    <div className="stat-item">
                                        <h4>100+</h4>
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
            </main>

            {/* Features Section */}
            <section id="features" className="features-section" aria-labelledby="features-title">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 id="features-title" className="section-title">Powerful Features</h2>
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
            <section id="pricing" className="pricing-section" aria-labelledby="pricing-title">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 id="pricing-title" className="section-title">Choose Your Plan</h2>
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
                                    <p className="plan-description">For individual landlords</p>
                                </div>
                                <div className="pricing-price">
                                    <span className="currency">TZS</span>
                                    <span className="amount">15,000</span>
                                    <span className="period">/month</span>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="bi bi-check-circle-fill"></i>Up to 5 properties</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Tenant & payment tracking</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Monthly reports</li>
                                </ul>
                                <button 
                                    className="odoo-btn odoo-btn-outline-primary w-100"
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
                                    <p className="plan-description">For growing portfolios</p>
                                </div>
                                <div className="pricing-price">
                                    <span className="currency">TZS</span>
                                    <span className="amount">35,000</span>
                                    <span className="period">/month</span>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="bi bi-check-circle-fill"></i>Up to 25 properties</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Advanced management & analytics</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Automated reminders</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Priority support</li>
                                </ul>
                                <button 
                                    className="odoo-btn odoo-btn-primary w-100"
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
                                    <p className="plan-description">For large managers</p>
                                </div>
                                <div className="pricing-price">
                                    <span className="currency">TZS</span>
                                    <span className="amount">75,000</span>
                                    <span className="period">/month</span>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="bi bi-check-circle-fill"></i>Unlimited properties</li>
                                    <li><i className="bi bi-check-circle-fill"></i>Multi-user & custom integrations</li>
                                    <li><i className="bi bi-check-circle-fill"></i>White-label options</li>
                                    <li><i className="bi bi-check-circle-fill"></i>24/7 phone support</li>
                                </ul>
                                <button 
                                    className="odoo-btn odoo-btn-outline-primary w-100"
                                    onClick={() => navigate("/register")}
                                >
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center mt-4">
                        <p className="pricing-note">
                            <i className="bi bi-shield-check text-primary me-2"></i>
                            14-day free trial • No credit card required
                        </p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section" aria-labelledby="about-title">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="about-content">
                                <h2 id="about-title" className="section-title">Why Choose Tanaka?</h2>
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
            <section id="testimonials" className="testimonials-section" aria-labelledby="testimonials-title">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 id="testimonials-title" className="section-title">What Our Users Say</h2>
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
            <section className="cta-section" aria-labelledby="cta-title">
                <div className="container">
                    <div className="text-center">
                        <h2 id="cta-title" className="cta-title">Ready to Get Started?</h2>
                        <p className="cta-description">
                            Join thousands of property managers who trust Tanaka for their business
                        </p>
                        <div className="cta-buttons d-flex flex-column flex-sm-row gap-3 justify-content-center">
                            <button 
                                className="odoo-btn odoo-btn-primary odoo-btn-lg"
                                onClick={() => navigate("/register")}
                            >
                                Start Free Trial
                            </button>
                            <button 
                                className="odoo-btn odoo-btn-outline-light odoo-btn-lg"
                                onClick={() => navigate("/login")}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Compact Version */}
            <footer id="contact" className="footer" role="contentinfo">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6">
                            <div className="footer-brand">
                                <img src="/Logo.png" alt="Tanaka Property Management Logo" width="40" height="40" className="me-2" />
                                <span className="brand-name">Tanaka</span>
                            </div>
                            <p className="footer-description">
                                Streamlining property management across Tanzania.
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <h6 className="footer-title">Contact</h6>
                            <div className="footer-contact">
                                <p><i className="bi bi-envelope-fill me-2" aria-hidden="true"></i><a href="mailto:info@tanaka.co.tz" aria-label="Send email to Tanaka support">info@tanaka.co.tz</a></p>
                                <p><i className="bi bi-telephone-fill me-2" aria-hidden="true"></i><a href="tel:+255762357820" aria-label="Call Tanaka support">+255 762 357 820</a></p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-12">
                            <h6 className="footer-title">Quick Links</h6>
                            <div className="row">
                                <div className="col-6">
                                    <ul className="footer-links">
                                        <li><a href="#features">Features</a></li>
                                        <li><a href="#pricing">Pricing</a></li>
                                    </ul>
                                </div>
                                <div className="col-6">
                                    <ul className="footer-links">
                                        <li><a href="/privacy-policy">Privacy</a></li>
                                        <li><a href="#contact">Support</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="footer-divider" />
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <p className="footer-copyright mb-0">
                                &copy; {new Date().getFullYear()} Tanaka. All rights reserved.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="footer-social">
                                <a href="https://www.linkedin.com/company/tanakas" className="social-link" aria-label="Follow Tanaka on LinkedIn" target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-linkedin" aria-hidden="true"></i>
                                </a>
                                <a href="https://www.instagram.com/tanakatanzania" className="social-link" aria-label="Follow Tanaka on Instagram" target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-instagram" aria-hidden="true"></i>
                                </a>
                                <a href="https://www.facebook.com/tanakatanzania" className="social-link" aria-label="Follow Tanaka on Facebook" target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-facebook" aria-hidden="true"></i>
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