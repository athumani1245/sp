import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfWeek, addDays, subDays } from 'date-fns';

const ReportSalesChart = ({ data: dashboardData, loading }) => {
    // Get available years from API data
    const getAvailableYears = () => {
        if (!dashboardData || !dashboardData.monthly_revenue_collection) return [];
        return Object.keys(dashboardData.monthly_revenue_collection).sort((a, b) => b - a);
    };

    const availableYears = getAvailableYears();
    const [viewType, setViewType] = useState('monthly'); // monthly, yearly
    const [selectedYear, setSelectedYear] = useState(availableYears.length > 0 ? availableYears[0] : new Date().getFullYear().toString());

    // Generate data from API response
    const generateData = () => {
        if (!dashboardData) return [];

        if (viewType === 'monthly') {
            // Use monthly_revenue_collection from API for selected year
            const monthlyData = dashboardData.monthly_revenue_collection || {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Get data for selected year
            const yearData = monthlyData[selectedYear] || {};
            
            // Create array for all 12 months
            return monthNames.map((monthName, index) => {
                const monthNum = (index + 1).toString();
                const monthNumPadded = monthNum.padStart(2, '0');
                // Try both formats: "1" and "01"
                const monthData = yearData[monthNum] || yearData[monthNumPadded] || { rent: 0, paid: 0 };
                
                return {
                    day: monthName,
                    billed: parseFloat(monthData.rent || 0),
                    collected: parseFloat(monthData.paid || 0),
                    fullDate: `${monthName} ${selectedYear}`
                };
            });
        } else {
            // Use yearly_revenue_collection from API
            const yearlyData = dashboardData.yearly_revenue_collection || {};
            const years = Object.keys(yearlyData).map(y => parseInt(y)).sort();
            
            return years.map((year) => {
                const yearStr = year.toString();
                const yearData = yearlyData[yearStr] || { rent: 0, paid: 0 };
                
                return {
                    day: yearStr,
                    billed: parseFloat(yearData.rent || 0),
                    collected: parseFloat(yearData.paid || 0),
                    fullDate: yearStr
                };
            });
        }
    };

    const data = generateData();

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
        }
        return value.toString();
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark text-white p-2 rounded shadow" style={{ fontSize: '12px' }}>
                    <p className="mb-1 fw-bold text-white">{payload[0].payload.fullDate}</p>
                    <p className="mb-1" style={{ color: '#4ade80' }}>
                        Billed: TSh {formatCurrency(payload[0].payload.billed)}
                    </p>
                    <p className="mb-0" style={{ color: '#60a5fa' }}>
                        Collected: TSh {formatCurrency(payload[0].payload.collected)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '320px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h6 className="fw-bold mb-1" style={{ fontSize: '16px' }}>Rent Billed vs Rent Collected</h6>
                                <div className="d-flex gap-3 mt-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#4ade80' }}></div>
                                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Billed</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#60a5fa' }}></div>
                                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Collected</span>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-3 align-items-center">
                                {/* View Type Toggle */}
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Monthly</span>
                                    <div className="form-check form-switch m-0">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            role="switch"
                                            checked={viewType === 'yearly'}
                                            onChange={(e) => setViewType(e.target.checked ? 'yearly' : 'monthly')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Yearly</span>
                                </div>

                                {/* Year Selector - Only show in monthly view */}
                                {viewType === 'monthly' && availableYears.length > 0 && (
                                    <select 
                                        className="form-select form-select-sm"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        style={{ 
                                            width: 'auto',
                                            fontSize: '13px',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            border: '1px solid #E5E7EB',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div style={{ width: '100%', height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={data}
                                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#999', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#999', fontSize: 12 }}
                                        tickFormatter={(value) => formatCurrency(value)}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Bar 
                                        dataKey="billed" 
                                        fill="#4ade80"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={25}
                                    />
                                    <Bar 
                                        dataKey="collected" 
                                        fill="#60a5fa"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={25}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportSalesChart;
