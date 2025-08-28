import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/styles/dashboard.css";
import Outstanding from "../components/snippets/Outstanding";
import Properties from "../components/snippets/Properties";
import Occupied from "../components/snippets/Occupied";
import Income from "../components/snippets/Income";
import Layout from "../components/Layout";
import { getDashboardInfo } from "../services/dashboardService";

function Dashboard() {
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
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login if not authenticated
        const access = localStorage.getItem("token");
        if (!access) {
            navigate("/");
            return;
        }

        fetchDashboardData();
    }, [navigate]);

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
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    

    return(
        <Layout>
            <div className="main-content">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        {/* fetch user name from response */}
                        <h2 className="fw-bold" style={{color:"#222"}}>
                            Hello, athumani
                        </h2>
                    </div>
                    <button className="record-btn"><i className="bi bi-plus-lg me-2"></i>Add</button>
                </div>
                <div className="mb-4">
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading dashboard...</span>
                            </div>
                            <div className="mt-2">Loading dashboard data...</div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                            <button 
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={fetchDashboardData}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="row g-3">
                            <Outstanding data={dashboardData} />
                            <Properties data={dashboardData} />
                            <Occupied data={dashboardData} />
                            <Income data={dashboardData} />
                        </div>
                    )}
                </div>
                <div className="tenant-table"></div>
                <div className="p-3 pb-0">
                    <h5 className="fw-bold mb-1">Tenant List</h5>
                    <div className="text-muted mb-3">Descriptions</div>
                </div>
                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center p-4">Loading tenants...</div>
                    ) : error ? (
                        <div className="alert alert-danger m-3">{error}</div>
                    ) : (
                        <table className="table mb-0">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Property</th>
                                <th>Rent Status</th>
                                <th>Lease Expiry <i className="bi bi-chevron-down"></i></th>
                            </tr>
                            </thead>
                            {/* <tbody>
                {tenantList.length > 0 ? tenantList.map((tenant, idx) => (
                    <tr key={tenant.id || idx}>
                        <td>{tenant.name}</td>
                        <td>{tenant.property}</td>
                        <td>{tenant.rent_status}</td>
                        <td>{tenant.lease_expiry}</td>
                    </tr>
                )) : (
                    <tr><td colSpan="4" className="text-center">No tenants found.</td></tr>
                )}
            </tbody> */}
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
}
export default Dashboard;