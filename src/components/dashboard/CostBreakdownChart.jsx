import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CostBreakdownChart = ({ data, loading }) => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);

    // Get available years from the payment data
    const availableYears = useMemo(() => {
        if (!data?.payment) return [];
        return Object.keys(data.payment).sort((a, b) => b - a);
    }, [data?.payment]);

    // Get available months for the selected year
    const availableMonths = useMemo(() => {
        if (!data?.payment || !selectedYear) return [];
        const months = Object.keys(data.payment[selectedYear] || {});
        return months.sort((a, b) => parseInt(a) - parseInt(b));
    }, [data?.payment, selectedYear]);

    // Initialize with current year and month
    useEffect(() => {
        if (availableYears.length > 0 && !selectedYear) {
            const currentYear = new Date().getFullYear().toString();
            const defaultYear = availableYears.includes(currentYear) ? currentYear : availableYears[0];
            setSelectedYear(defaultYear);
        }
    }, [availableYears, selectedYear]);

    useEffect(() => {
        if (availableMonths.length > 0 && !selectedMonth) {
            const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
            const defaultMonth = availableMonths.includes(currentMonth) ? currentMonth : availableMonths[availableMonths.length - 1];
            setSelectedMonth(defaultMonth);
        }
    }, [availableMonths, selectedMonth]);

    // Payment categories colors mapping
    const categoryColors = {
        'RENT': '#7cb5a0',
        'ELECTRICITY': '#f59e0b',
        'WATER': '#60a5fa',
        'Security Deposit': '#a78bfa',
        'SERVICE_CHARGE': '#ec4899',
        'OTHER': '#6b7280'
    };

    // Generate payment data from API response
    const paymentData = useMemo(() => {
        if (!data?.payment || !selectedYear || !selectedMonth) {
            return [];
        }

        const monthData = data.payment[selectedYear]?.[selectedMonth];
        if (!monthData) return [];

        return Object.entries(monthData)
            .map(([category, value]) => ({
                name: category.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' '),
                value: Math.abs(parseFloat(value) || 0), // Use absolute value to handle negative values
                color: categoryColors[category] || '#6b7280'
            }))
            .filter(item => item.value > 0); // Only show positive values
    }, [data?.payment, selectedYear, selectedMonth]);

    const total = paymentData.reduce((sum, item) => sum + item.value, 0);

    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
            return (
                <div className="bg-white p-2 rounded shadow border" style={{ fontSize: '12px' }}>
                    <p className="mb-0 fw-bold">{payload[0].name}</p>
                    <p className="mb-0 text-success">TSh {payload[0].value.toLocaleString()}</p>
                    <p className="mb-0 text-muted">{percentage}%</p>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy }) => {
        if (total === 0) {
            return (
                <text 
                    x={cx} 
                    y={cy} 
                    fill="#6b7280" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                    style={{ fontSize: '14px' }}
                >
                    No Data
                </text>
            );
        }
        const displayValue = total >= 1000000 
            ? `${(total / 1000000).toFixed(1)}M` 
            : total >= 1000
            ? `${(total / 1000).toFixed(0)}k`
            : total.toFixed(0);
        return (
            <text 
                x={cx} 
                y={cy} 
                fill="#1a1a1a" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontSize: '24px', fontWeight: 'bold' }}
            >
                TSh {displayValue}
            </text>
        );
    };

    const CustomLegend = ({ payload }) => {
        if (!payload || payload.length === 0) return null;
        return (
            <div className="row g-2 mt-3">
                {payload.map((entry, index) => (
                    <div key={index} className="col-6">
                        <div className="d-flex align-items-center gap-2">
                            <div 
                                style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%', 
                                    background: entry.color,
                                    flexShrink: 0
                                }}
                            />
                            <span style={{ fontSize: '12px', color: '#666' }}>{entry.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '16px' }}>Payments Breakdown</h6>
                    <div className="d-flex gap-2">
                        {/* Year Filter */}
                        <div className="dropdown">
                            <button 
                                className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center gap-2" 
                                type="button" 
                                data-bs-toggle="dropdown"
                                style={{ fontSize: '13px', borderRadius: '8px', padding: '6px 12px' }}
                                disabled={availableYears.length === 0}
                            >
                                <i className="bi bi-calendar-year"></i>
                                {selectedYear || 'Year'}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: '13px' }}>
                                {availableYears.map(year => (
                                    <li key={year}>
                                        <button 
                                            className={`dropdown-item ${selectedYear === year ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedYear(year);
                                                setSelectedMonth(null);
                                            }}
                                        >
                                            {year}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Month Filter */}
                        <div className="dropdown">
                            <button 
                                className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center gap-2" 
                                type="button" 
                                data-bs-toggle="dropdown"
                                style={{ fontSize: '13px', borderRadius: '8px', padding: '6px 12px' }}
                                disabled={availableMonths.length === 0}
                            >
                                <i className="bi bi-calendar3"></i>
                                {selectedMonth ? monthNames[parseInt(selectedMonth)] : 'Month'}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: '13px', maxHeight: '250px', overflowY: 'auto' }}>
                                {availableMonths.map(month => (
                                    <li key={month}>
                                        <button 
                                            className={`dropdown-item ${selectedMonth === month ? 'active' : ''}`}
                                            onClick={() => setSelectedMonth(month)}
                                        >
                                            {monthNames[parseInt(month)]}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : paymentData.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-pie-chart text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted mt-3 mb-0">
                            No payment data available for {monthNames[parseInt(selectedMonth)]} {selectedYear}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ width: '100%', height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <CustomLegend payload={paymentData} />
                    </>
                )}
            </div>
        </div>
    );
};

export default CostBreakdownChart;
