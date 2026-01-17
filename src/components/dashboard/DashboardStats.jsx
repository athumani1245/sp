import React from 'react';

const PropertyStatCard = ({ data, loading }) => {
    return (
        <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: '#f5f5f5', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="bi bi-building" style={{ fontSize: '20px', color: '#666' }}></i>
                            </div>
                            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>Properties & Units</span>
                        </div>
                        <button className="btn btn-link p-0 text-muted" style={{ lineHeight: 1 }}>
                            <i className="bi bi-three-dots" style={{ fontSize: '18px' }}></i>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="placeholder-glow">
                            <span className="placeholder col-6" style={{ height: '40px' }}></span>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex align-items-center gap-2">
                                <h3 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#111827' }}>
                                    {data.properties}
                                </h3>
                                <span style={{ fontSize: '14px', color: '#6B7280' }}>properties</span>
                                <span style={{ fontSize: '18px', color: '#E5E7EB', margin: '0 4px' }}>|</span>
                                <h3 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#111827' }}>
                                    {data.units}
                                </h3>
                                <span style={{ fontSize: '14px', color: '#6B7280' }}>units</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const OccupancyStatCard = ({ data, loading }) => {
    return (
        <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: '#f5f5f5', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="bi bi-door-open" style={{ fontSize: '20px', color: '#666' }}></i>
                            </div>
                            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>Occupancy</span>
                        </div>
                        <button className="btn btn-link p-0 text-muted" style={{ lineHeight: 1 }}>
                            <i className="bi bi-three-dots" style={{ fontSize: '18px' }}></i>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="placeholder-glow">
                            <span className="placeholder col-6" style={{ height: '40px' }}></span>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex align-items-center gap-2">
                                <h3 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#111827' }}>
                                    {data.occupied}
                                </h3>
                                <span style={{ fontSize: '14px', color: '#6B7280' }}>occupied</span>
                                <span style={{ fontSize: '18px', color: '#E5E7EB', margin: '0 4px' }}>|</span>
                                <h3 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#111827' }}>
                                    {data.vacant}
                                </h3>
                                <span style={{ fontSize: '14px', color: '#6B7280' }}>vacant</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, change, changeLabel, loading }) => {
    const isPositive = change >= 0;
    
    return (
        <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: '#f5f5f5', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {icon}
                            </div>
                            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>{title}</span>
                        </div>
                        <button className="btn btn-link p-0 text-muted" style={{ lineHeight: 1 }}>
                            <i className="bi bi-three-dots" style={{ fontSize: '18px' }}></i>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="placeholder-glow">
                            <span className="placeholder col-6" style={{ height: '40px' }}></span>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <h2 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#111827', lineHeight: '1' }}>
                                    {value}
                                </h2>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`d-inline-flex align-items-center ${isPositive ? 'text-success' : 'text-danger'}`} 
                                          style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                        {isPositive ? '↑' : '↓'}{Math.abs(change)}%
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                                        {changeLabel}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardStats = ({ data, loading, error, onRetry }) => {
    if (error) {
        return (
            <div className="alert alert-danger mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error.message || 'Failed to load statistics'}
                <button 
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={onRetry}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Retry
                </button>
            </div>
        );
    }

    const stats = {
        totalProperty: data?.summary?.total_number_of_properties || 0,
        totalUnits: data?.summary?.total_units || 0,
        occupiedUnits: data?.summary?.occupied_units || 0,
        vacantUnits: data?.summary?.vacant_units || 0,
        totalLeases: data?.summary?.occupied_units || 0,
        totalRevenue: data?.summary?.total_rent_collected || 0,
        expectedRent: data?.summary?.total_expected_rent || 0,
        pendingIncome: data?.summary?.pending_income || 0,
    };

    // Calculate dummy percentage changes (you can replace with actual data from API)
    const propertyChange = 20;
    const unitsChange = 15;
    const leasesChange = -20;
    const revenueChange = 20;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'TSh 0';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'TSh 0';
        
        if (numAmount >= 1000000) {
            return `TSh ${(numAmount / 1000000).toFixed(1)}M`;
        } else if (numAmount >= 1000) {
            return `TSh ${(numAmount / 1000).toFixed(0)}k`;
        }
        return `TSh ${numAmount.toLocaleString()}`;
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString();
    };

    return (
        <div className="row g-3 mb-4">
            <PropertyStatCard
                data={{
                    properties: formatNumber(stats.totalProperty),
                    units: formatNumber(stats.totalUnits)
                }}
                loading={loading}
            />
            <OccupancyStatCard
                data={{
                    occupied: formatNumber(stats.occupiedUnits),
                    vacant: formatNumber(stats.vacantUnits)
                }}
                loading={loading}
            />
            <StatCard
                icon={<i className="bi bi-file-text" style={{ fontSize: '20px', color: '#666' }}></i>}
                title="Total Leases"
                value={formatNumber(stats.totalLeases)}
                change={leasesChange}
                changeLabel={`Last month total ${formatNumber(stats.totalLeases + Math.round(stats.totalLeases * 0.2))}`}
                loading={loading}
            />
            <div className="col-12 col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    background: '#f5f5f5', 
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i className="bi bi-currency-dollar" style={{ fontSize: '20px', color: '#666' }}></i>
                                </div>
                                <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>Revenue</span>
                            </div>
                            <button className="btn btn-link p-0 text-muted" style={{ lineHeight: 1 }}>
                                <i className="bi bi-three-dots" style={{ fontSize: '18px' }}></i>
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="placeholder-glow">
                                <span className="placeholder col-6" style={{ height: '40px' }}></span>
                            </div>
                        ) : (
                            <>
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                    <div>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#111827' }}>
                                            {formatCurrency(data?.summary?.total_revenue || 0)}
                                        </h3>
                                        <span style={{ fontSize: '11px', color: '#6B7280' }}>revenue</span>
                                    </div>
                                    <span style={{ fontSize: '16px', color: '#E5E7EB', margin: '0 4px' }}>|</span>
                                    <div>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#EF4444' }}>
                                            {formatCurrency(data?.summary?.total_outstanding_payment || 0)}
                                        </h3>
                                        <span style={{ fontSize: '11px', color: '#6B7280' }}>outstanding</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
