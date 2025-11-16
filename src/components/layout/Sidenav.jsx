import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Toast from "../Toast";
import "../../assets/styles/sidenav.css";

function Sidenav(){
    const navigate = useNavigate();
    const [openDropdowns, setOpenDropdowns] = useState({
        reports: false,
        leases: false,
        properties: false,
        propertiesMain: false,
        tenants: false,
        finance: false
    });
    
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({});

    const reportRoutes = {
        'lease_agreements': '/reports/lease-agreements',
        'lease_expiry': '/reports/lease-expiry',
        'lease_renewal_termination': '/reports/lease-renewal-termination',
        'property_summary': '/reports/property-summary',
        'units_availability': '/reports/units-availability',
        'property_performance': '/reports/property-performance',
        'tenant_directory': '/reports/tenant-directory',
        'tenant_payment_history': '/reports/tenant-payment-history',
        'tenant_outstanding_balance': '/reports/tenant-outstanding-balance',
        'payment_summary': '/reports/payment-summary',
        'occupancy_report': '/reports/occupancy-report',
        'income_report': '/reports/income-report',
        'expense_report': '/reports/expense-report'
    };
    
    const showToastMessage = (title, message, variant = 'success') => {
        setToastConfig({ title, message, variant });
        setShowToast(true);
    };

    const handleReportClick = (reportType) => {
        const route = reportRoutes[reportType];
        if (!route) {
            console.error('Unknown report type:', reportType);
            showToastMessage('Error', 'Unknown report type selected.', 'danger');
            return;
        }
        
        // Navigate to the report page
        navigate(route);
    };

    const toggleDropdown = (dropdownName, event) => {
        event.preventDefault();
        event.stopPropagation();
        
        setOpenDropdowns(prev => {
            const newState = { ...prev };
            
            // If clicking on main reports dropdown
            if (dropdownName === 'reports') {
                    newState.reports = !prev.reports;
                // Close all sub-dropdowns when closing main reports
                if (!newState.reports) {
                    newState.leases = false;
                    newState.properties = false;
                    newState.tenants = false;
                    newState.finance = false;
                }
            } else if (dropdownName === 'propertiesMain') {
                // Toggle main properties dropdown
                newState.propertiesMain = !prev.propertiesMain;
            } else {
                // Toggle specific sub-dropdown
                newState[dropdownName] = !prev[dropdownName];
            }            return newState;
        });
    };

    return (
        <nav className="col-lg-2 sidebar">
            <ul className="nav flex-column">
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/dashboard">
                        <i className="bi bi-house"></i> Home
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/properties">
                        <i className="bi bi-building"></i> Properties
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/property-managers">
                        <i className="bi bi-people"></i> Property Managers
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/tenants">
                        <i className="bi bi-person"></i> Tenants
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/leases">
                        <i className="bi bi-file-earmark-text"></i> Leases
                    </NavLink>
                </li>
                
                {/* Reports Collapsible Menu */}
                <li className="nav-item">
                    <a className={`nav-link ${openDropdowns.reports ? 'active' : ''}`} 
                       href="#" 
                       onClick={(e) => toggleDropdown('reports', e)}>
                        <i className="bi bi-folder"></i> Reports
                        <i className={`bi bi-chevron-${openDropdowns.reports ? 'down' : 'right'} ms-auto`}></i>
                    </a>
                </li>
                
                {/* Leases Submenu */}
                {openDropdowns.reports && (
                    <li className="nav-item">
                        <a className={`nav-link submenu-item ${openDropdowns.leases ? 'active' : ''}`} 
                           href="#" 
                           onClick={(e) => toggleDropdown('leases', e)}>
                            Leases
                            <i className={`bi bi-chevron-${openDropdowns.leases ? 'down' : 'right'} ms-auto`}></i>
                        </a>
                    </li>
                )}
                
                {openDropdowns.reports && openDropdowns.leases && (
                    <>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('lease_agreements')}>
                                Lease Agreements
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('lease_expiry')}>
                                Lease Expiry
                            </a>
                        </li>
                    </>
                )}
                
                {/* Properties Submenu */}
                {openDropdowns.reports && (
                    <li className="nav-item">
                        <a className={`nav-link submenu-item ${openDropdowns.properties ? 'active' : ''}`} 
                           href="#" 
                           onClick={(e) => toggleDropdown('properties', e)}>
                            Properties
                            <i className={`bi bi-chevron-${openDropdowns.properties ? 'down' : 'right'} ms-auto`}></i>
                        </a>
                    </li>
                )}
                
                {openDropdowns.reports && openDropdowns.properties && (
                    <>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('property_summary')}>
                                Property Summarry
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('property_performance')}>
                                Property Performance
                            </a>
                        </li>
                    </>
                )}
                
                {/* Tenants Submenu */}
                {openDropdowns.reports && (
                    <li className="nav-item">
                        <a className={`nav-link submenu-item ${openDropdowns.tenants ? 'active' : ''}`} 
                           href="#" 
                           onClick={(e) => toggleDropdown('tenants', e)}>
                            Tenants
                            <i className={`bi bi-chevron-${openDropdowns.tenants ? 'down' : 'right'} ms-auto`}></i>
                        </a>
                    </li>
                )}
                
                {openDropdowns.reports && openDropdowns.tenants && (
                    <>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('tenant_payment_history')}>
                                Payment History
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('tenant_outstanding_balance')}>
                                Outstanding Balance
                            </a>
                        </li>
                    </>
                )}
                
                
                {/* {openDropdowns.reports && (
                    <li className="nav-item">
                        <a className={`nav-link submenu-item ${openDropdowns.finance ? 'active' : ''}`} 
                           href="#" 
                           onClick={(e) => toggleDropdown('finance', e)}>
                            <i className="bi bi-cash-stack"></i> Finance
                            <i className={`bi bi-chevron-${openDropdowns.finance ? 'down' : 'right'} ms-auto`}></i>
                        </a>
                    </li>
                )} */}
                
                {openDropdowns.reports && openDropdowns.finance && (
                    <>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('payment_summary')}>
                                Payment Summary
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('occupancy_report')}>
                                Occupancy Report
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('income_report')}>
                                Income Report
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link sub-item" href="#" onClick={() => handleReportClick('expense_report')}>
                                Expense Report
                            </a>
                        </li>
                    </>
                )}
                
                
                {/*
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-tools"></i> Maintenance Request
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-bar-chart"></i> Report & Analytics
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-gear"></i> Settings
                    </NavLink>
                </li> */}
            </ul>
            
            {/* Toast notification */}
            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                title={toastConfig.title}
                message={toastConfig.message}
                variant={toastConfig.variant}
                autoHide={true}
                delay={4000}
            />
        </nav>
    );
};

export default Sidenav;