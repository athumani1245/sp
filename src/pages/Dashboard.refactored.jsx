/**
 * Dashboard Page - Refactored Version
 * Uses constants and improved structure
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SubscriptionBanner from "../components/SubscriptionBanner";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import Outstanding from "../components/snippets/Outstanding";
import Properties from "../components/snippets/Properties";
import Occupied from "../components/snippets/Occupied";
import Income from "../components/snippets/Income";
import { getDashboardInfo } from "../services/dashboardService";
import { getLeases } from "../services/leaseService";
import { getUserProfile } from "../services/profileService";
import { usePageTitle } from "../hooks/usePageTitle";
import { LEASE_STATUS, ROUTES } from "../config/constants";
import "../assets/styles/dashboard.css";

function Dashboard() {
    usePageTitle('Dashboard');
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardData, setDashboardData] = useState({
        total_number_of_properties: 0,
        total_rent_collected: "0.00",
        total_units: 0,
        total_expected_rent: "0.00",
        pending_income: "0.00",
        occupied_units: 0,
        vacant_units: 0
    });
    const [userProfile, setUserProfile] = useState({
        first_name: "",
        last_name: ""
    });
    const [leases, setLeases] = useState([]);
    const [leasesLoading, setLeasesLoading] = useState(false);
    const [leasesError, setLeasesError] = useState("");

    useEffect(() => {
        // Redirect to login if not authenticated
        const access = localStorage.getItem("token");
        if (!access) {
            navigate(ROUTES.LOGIN);
            return;
        }

        fetchDashboardData();
        fetchUserProfile();
        fetchRecentLeases();
    }, [navigate]);

    const fetchUserProfile = async () => {
        try {
            const result = await getUserProfile();
            if (result.success) {
                setUserProfile(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    };

    const fetchRecentLeases = async () => {
        try {
            setLeasesLoading(true);
            setLeasesError("");
            const response = await getLeases({ limit: 10 });
            
            if (response.success || response.status) {
                const leasesData = Array.isArray(response.data) ? response.data : [];
                
                // Filter out terminated/ended/expired leases
                const activeLeases = leasesData.filter(lease => 
                    lease.status !== LEASE_STATUS.TERMINATED && 
                    lease.status !== LEASE_STATUS.EXPIRED &&
                    lease.status !== 'ended'
                );
                
                // Sort by end date - closest to expiring first
                const sortedLeases = activeLeases.sort((a, b) => {
                    const dateA = a.end_date ? new Date(a.end_date.split('-').reverse().join('-')) : new Date('9999-12-31');
                    const dateB = b.end_date ? new Date(b.end_date.split('-').reverse().join('-')) : new Date('9999-12-31');
                    return dateA - dateB;
                });
                
                setLeases(sortedLeases);
            } else {
                setLeasesError(response.error || response.description || "Failed to load leases");
            }
        } catch (err) {
            setLeasesError("An error occurred while loading leases");
        } finally {
            setLeasesLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");
        
        try {
            const result = await getDashboardInfo();
            
            if (result.success) {
                setDashboardData(result.data);
            } else {
                setError(result.error || "Failed to load dashboard data");
            }
        } catch (err) {
            setError("An error occurred while loading dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case LEASE_STATUS.ACTIVE:
                return 'bg-success';
            case LEASE_STATUS.TERMINATED:
                return 'bg-danger';
            case LEASE_STATUS.EXPIRED:
                return 'bg-warning text-dark';
            case LEASE_STATUS.DRAFT:
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'TSh 0';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'TSh 0';
        return `TSh ${numAmount.toLocaleString()}`;
    };

    return (
        <Layout>
            <div className="main-content">
                {/* Subscription Banner */}
                <SubscriptionBanner />
                
                {/* Welcome Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2 className="fw-bold" style={{color:"#222"}}>
                            Hello, {userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'}
                        </h2>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-4">
                    {loading ? (
                        <DashboardSkeleton />
                    ) : error ? (
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                            <button 
                                className="odoo-btn odoo-btn-outline-primary odoo-btn-sm ms-2"
                                onClick={fetchDashboardData}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="row g-3 stats-card">
                            <Outstanding data={dashboardData} />
                            <Properties data={dashboardData} />
                            <Occupied data={dashboardData} />
                            <Income data={dashboardData} />
                        </div>
                    )}
                </div>
                
                {/* Recent Leases Section */}
                <div className="mt-4">
                    <div className="p-3 pb-0">
                        <div>
                            <h5 className="fw-bold mb-1">Upcoming Lease Expirations</h5>
                        </div>
                    </div>
                    <div className="table-responsive">
                        {leasesLoading ? (
                            <TableSkeleton rows={3} columns={5} showHeader={false} />
                        ) : leasesError ? (
                            <div className="alert alert-danger m-3">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {leasesError}
                                <button 
                                    className="odoo-btn odoo-btn-outline-primary odoo-btn-sm ms-2"
                                    onClick={fetchRecentLeases}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Property</th>
                                        <th>Unit</th>
                                        <th>Rent Amount</th>
                                        <th>Status</th>
                                        <th>End Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leases.length > 0 ? leases.map((lease, idx) => (
                                        <tr key={lease.id || idx}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                                                        {lease.tenant?.first_name ? lease.tenant.first_name.charAt(0) : 'T'}
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium">
                                                            {lease.tenant ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim() : 'N/A'}
                                                        </div>
                                                        <small className="text-muted">
                                                            {lease.tenant?.username || ''}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-medium">
                                                    {lease.property?.property_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {lease.unit?.unit_name || lease.unit?.unit_number || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fw-medium text-success">
                                                    {formatCurrency(lease.rent_amount_per_unit)}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(lease.status)}`}>
                                                    {lease.status || LEASE_STATUS.DRAFT}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="text-muted">
                                                    {lease.end_date || 'N/A'}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <div className="text-muted">
                                                    <i className="bi bi-file-earmark-text display-4 d-block mb-2"></i>
                                                    No leases found
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Dashboard;
