/**
 * Dashboard Page - Redesigned Version
 * Modern dashboard with charts and statistics
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import SubscriptionBanner from "../components/SubscriptionBanner";
import { getDashboardInfo } from "../services/dashboardService";
import { getLeases } from "../services/leaseService";
import { getUserProfile } from "../services/profileService";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTES } from "../config/constants";
import DashboardStats from "../components/dashboard/DashboardStats";
import ReportSalesChart from "../components/dashboard/ReportSalesChart";
import CostBreakdownChart from "../components/dashboard/CostBreakdownChart";
import LastTransactions from "../components/dashboard/LastTransactions";
import MaintenanceRequests from "../components/dashboard/MaintenanceRequests";
import "../assets/styles/dashboard.css";

function Dashboard() {
    usePageTitle('Dashboard');
    const navigate = useNavigate();

    // Check authentication
    React.useEffect(() => {
        const access = localStorage.getItem("token");
        if (!access) {
            navigate(ROUTES.LOGIN);
        }
    }, [navigate]);

    // Fetch user profile
    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const result = await getUserProfile();
            if (result.success) return result.data;
            return { first_name: "", last_name: "" };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch dashboard data
    const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useQuery({
        queryKey: ['dashboardInfo'],
        queryFn: async () => {
            const result = await getDashboardInfo();
            if (result.success) return result.data;
            throw new Error(result.error || "Failed to load dashboard data");
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch leases for transactions
    const { data: leases, isLoading: leasesLoading, error: leasesError, refetch: refetchLeases } = useQuery({
        queryKey: ['recentLeases'],
        queryFn: async () => {
            const response = await getLeases({ limit: 10 });
            if (response.success || response.status) {
                const leasesData = Array.isArray(response.data) ? response.data : [];
                return leasesData;
            }
            throw new Error(response.error || "Failed to load leases");
        },
        staleTime: 2 * 60 * 1000,
    });

    const getUserName = () => {
        if (userProfile?.first_name) {
            return `${userProfile.first_name} ${userProfile.last_name || ''}`.trim();
        }
        return 'User';
    };

    return (
        <Layout>
            <div className="main-content" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
                {/* Subscription Banner */}
                <SubscriptionBanner />
                
                {/* Welcome Header */}
                <div className="mb-4">
                    <h2 className="fw-bold mb-1" style={{ color: "#1a1a1a", fontSize: '28px' }}>
                        Hello, {getUserName()}!
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                        Explore information and activity about your property
                    </p>
                </div>

                {/* Stats Cards */}
                <DashboardStats 
                    data={dashboardData}
                    loading={dashboardLoading}
                    error={dashboardError}
                    onRetry={refetchDashboard}
                />

                {/* Charts Row */}
                <div className="row g-3 mb-3">
                    {/* Report Sales Chart */}
                    <div className="col-12 col-lg-7">
                        <ReportSalesChart />
                    </div>

                    {/* Cost Breakdown Chart */}
                    <div className="col-12 col-lg-5">
                        <CostBreakdownChart data={dashboardData} loading={dashboardLoading} />
                    </div>
                </div>

                {/* Bottom Row - Transactions and Maintenance */}
                <div className="row g-3">
                    {/* Last Transactions */}
                    <div className="col-12 col-lg-6">
                        <LastTransactions 
                            leases={leases}
                            loading={leasesLoading}
                            error={leasesError}
                            onRetry={refetchLeases}
                        />
                    </div>

                    {/* Maintenance Requests */}
                    <div className="col-12 col-lg-6">
                        <MaintenanceRequests />
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Dashboard;
