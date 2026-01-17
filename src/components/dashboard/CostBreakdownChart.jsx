import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CostBreakdownChart = ({ data, loading }) => {
    const [viewType, setViewType] = useState('monthly'); // monthly, yearly

    // Payment categories data based on view type
    const generatePaymentData = () => {
        const baseMultiplier = viewType === 'monthly' ? 1 : 12;
        return [
            { name: 'Rent', value: Math.floor((Math.random() * 30000 + 50000) * baseMultiplier), color: '#7cb5a0' },
            { name: 'Electricity', value: Math.floor((Math.random() * 10000 + 15000) * baseMultiplier), color: '#f59e0b' },
            { name: 'Water', value: Math.floor((Math.random() * 5000 + 8000) * baseMultiplier), color: '#60a5fa' },
            { name: 'Security Deposit', value: Math.floor((Math.random() * 8000 + 10000) * baseMultiplier), color: '#a78bfa' },
            { name: 'Service Charge', value: Math.floor((Math.random() * 5000 + 7000) * baseMultiplier), color: '#ec4899' },
            { name: 'Other', value: Math.floor((Math.random() * 3000 + 5000) * baseMultiplier), color: '#6b7280' }
        ];
    };

    const paymentData = generatePaymentData();
    const total = paymentData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percentage = ((payload[0].value / total) * 100).toFixed(1);
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
        const displayValue = total >= 1000000 
            ? `${(total / 1000000).toFixed(1)}M` 
            : `${(total / 1000).toFixed(0)}k`;
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
        return (
            <div className="row g-2 mt-3">
                {payload.map((entry, index) => (
                    <div key={index} className="col-4">
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
                    <div className="dropdown">
                        <button 
                            className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center gap-2" 
                            type="button" 
                            data-bs-toggle="dropdown"
                            style={{ fontSize: '13px', borderRadius: '8px', padding: '6px 12px' }}
                        >
                            <i className="bi bi-calendar3"></i>
                            {viewType === 'monthly' ? 'Monthly' : 'Yearly'}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: '13px' }}>
                            <li>
                                <button className="dropdown-item" onClick={() => setViewType('monthly')}>
                                    Monthly
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={() => setViewType('yearly')}>
                                    Yearly
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
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
