import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import { 
    createTourDriver, 
    dashboardTourSteps,
    addPropertyTourSteps, 
    addUnitTourSteps, 
    addTenantTourSteps, 
    addLeaseTourSteps, 
    addPaymentTourSteps,
    propertyDetailsTourSteps
} from '../utils/tourConfig';
import '../assets/styles/tour.css';

const TourHelpButton = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { startTour, completeTour, tourCompleted, resetAllTours } = useTour();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStartTour = (tourName, steps, redirectPath) => {
        setShowDropdown(false);
        startTour(tourName);
        
        // Navigate to the appropriate page if needed
        if (redirectPath && window.location.pathname !== redirectPath) {
            navigate(redirectPath);
            // Wait for page to load before starting tour
            setTimeout(() => {
                const driverObj = createTourDriver(() => completeTour(tourName));
                driverObj.setSteps(steps);
                driverObj.drive();
            }, 500);
        } else {
            const driverObj = createTourDriver(() => completeTour(tourName));
            driverObj.setSteps(steps);
            driverObj.drive();
        }
    };

    const handleResetAll = () => {
        resetAllTours();
        setShowDropdown(false);
    };

    return (
        <div className="tour-dropdown" ref={dropdownRef}>
            <button
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                onClick={() => setShowDropdown(!showDropdown)}
                title="Help & Tours"
                style={{ color: '#4b5e6b', fontSize: '16px' }}
            >
                <i className="bi bi-question-circle" style={{ fontSize: '20px' }}></i>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Guide</span>
            </button>

            {showDropdown && (
                <div className="tour-dropdown-menu">
                    <div className="tour-dropdown-header">
                        <i className="bi bi-compass"></i>
                        <span>Guided Tours</span>
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={() => handleStartTour('dashboard', dashboardTourSteps, '/dashboard')}
                    >
                        <i className="bi bi-house-door"></i>
                        <div>
                            <div style={{ fontWeight: 500 }}>Dashboard Guide</div>
                            {/* <small style={{ color: '#666' }}>Get started with the basics</small> */}
                        </div>
                        {tourCompleted.dashboard && <i className="bi bi-check-circle-fill ms-auto" style={{ color: '#28a745' }}></i>}
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={() => handleStartTour('addProperty', addPropertyTourSteps, '/properties')}
                    >
                        <i className="bi bi-building"></i>
                        <div>
                            <div style={{ fontWeight: 500 }}>Property Guide</div>
                            {/* <small style={{ color: '#666' }}>Learn how to add a new property</small> */}
                        </div>
                        {tourCompleted.addProperty && <i className="bi bi-check-circle-fill ms-auto" style={{ color: '#28a745' }}></i>}
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={() => handleStartTour('addUnit', addUnitTourSteps, '/properties')}
                    >
                        <i className="bi bi-door-open"></i>
                        <div>
                            <div style={{ fontWeight: 500 }}>Unit Guide</div>
                            {/* <small style={{ color: '#666' }}>Learn how to add units to a property</small> */}
                        </div>
                        {tourCompleted.addUnit && <i className="bi bi-check-circle-fill ms-auto" style={{ color: '#28a745' }}></i>}
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={() => handleStartTour('addTenant', addTenantTourSteps, '/tenants')}
                    >
                        <i className="bi bi-person-plus"></i>
                        <div>
                            <div style={{ fontWeight: 500 }}>Tenant Guide</div>
                            {/* <small style={{ color: '#666' }}>Learn how to register a new tenant</small> */}
                        </div>
                        {tourCompleted.addTenant && <i className="bi bi-check-circle-fill ms-auto" style={{ color: '#28a745' }}></i>}
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={() => handleStartTour('addLease', addLeaseTourSteps, '/leases')}
                    >
                        <i className="bi bi-file-earmark-text"></i>
                        <div>
                            <div style={{ fontWeight: 500 }}>Lease Guide</div>
                            {/* <small style={{ color: '#666' }}>Learn how to create a lease agreement</small> */}
                        </div>
                        {tourCompleted.addLease && <i className="bi bi-check-circle-fill ms-auto" style={{ color: '#28a745' }}></i>}
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={() => handleStartTour('addPayment', addPaymentTourSteps, '/leases')}
                    >
                        <i className="bi bi-cash-coin"></i>
                        <div>
                            <div style={{ fontWeight: 500 }}>Payment Guide</div>
                            {/* <small style={{ color: '#666' }}>Learn how to record lease payments</small> */}
                        </div>
                        {tourCompleted.addPayment && <i className="bi bi-check-circle-fill ms-auto" style={{ color: '#28a745' }}></i>}
                    </div>
                    
                    <div 
                        className="tour-dropdown-item"
                        onClick={handleResetAll}
                        style={{ borderTop: '2px solid #f0f0f0', marginTop: '5px' }}
                    >
                        <i className="bi bi-arrow-clockwise" style={{ color: '#666' }}></i>
                        <div style={{ color: '#666' }}>
                            <div style={{ fontWeight: 500 }}>Reset All Guides</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourHelpButton;
