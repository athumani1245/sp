import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to our logging service
        logger.error('React Error Boundary caught an error', error, errorInfo);
        
        // In production, you might want to send this to an error reporting service
        if (process.env.REACT_APP_ENVIRONMENT === 'production' && window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: true
            });
        }
    }

    render() {
        if (this.state.hasError) {
            // Custom error UI
            return (
                <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="error-icon mb-4">
                            <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h2 className="mb-3">Oops! Something went wrong</h2>
                        <p className="text-muted mb-4">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button 
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Refresh Page
                            </button>
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={() => window.location.href = '/'}
                            >
                                <i className="bi bi-house me-2"></i>
                                Go Home
                            </button>
                        </div>
                        {process.env.REACT_APP_ENVIRONMENT === 'development' && this.state.error && (
                            <details className="mt-4 text-start">
                                <summary className="btn btn-outline-info btn-sm">Show Error Details</summary>
                                <pre className="mt-2 p-3 bg-light border rounded text-danger small">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;