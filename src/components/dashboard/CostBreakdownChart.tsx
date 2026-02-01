import React, { useState, useEffect, useMemo } from 'react';
import { Card, Select, Typography } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const { Text } = Typography;
const { Option } = Select;

interface CostBreakdownChartProps {
  data: any;
  loading: boolean;
}

const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ data, loading }) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    if (!data?.payment) return [];
    return Object.keys(data.payment).sort((a, b) => Number(b) - Number(a));
  }, [data?.payment]);

  const availableMonths = useMemo(() => {
    if (!data?.payment || !selectedYear) return [];
    const months = Object.keys(data.payment[selectedYear] || {});
    return months.sort((a, b) => parseInt(a) - parseInt(b));
  }, [data?.payment, selectedYear]);

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

  const categoryColors: Record<string, string> = {
    RENT: '#7cb5a0',
    ELECTRICITY: '#f59e0b',
    WATER: '#60a5fa',
    'Security Deposit': '#a78bfa',
    SERVICE_CHARGE: '#ec4899',
    OTHER: '#6b7280',
  };

  const paymentData = useMemo(() => {
    if (!data?.payment || !selectedYear || !selectedMonth) {
      return [];
    }

    const monthData = data.payment[selectedYear]?.[selectedMonth];
    if (!monthData) return [];

    return Object.entries(monthData)
      .map(([category, value]: [string, any]) => ({
        name: category
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '),
        value: Math.abs(parseFloat(value) || 0),
        color: categoryColors[category] || '#6b7280',
      }))
      .filter((item) => item.value > 0);
  }, [data?.payment, selectedYear, selectedMonth]);

  const total = paymentData.reduce((sum, item) => sum + item.value, 0);

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <div
          style={{
            background: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>{payload[0].name}</p>
          <p style={{ marginBottom: '4px', color: '#10b981' }}>TSh {payload[0].value.toLocaleString()}</p>
          <p style={{ marginBottom: 0, color: '#6b7280' }}>{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy }: any) => {
    if (total === 0) {
      return (
        <text x={cx} y={cy} fill="#6b7280" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '14px' }}>
          No Data
        </text>
      );
    }
    const displayValue =
      total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : total >= 1000 ? `${(total / 1000).toFixed(0)}k` : total.toFixed(0);
    return (
      <text x={cx} y={cy} fill="#1a1a1a" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '24px', fontWeight: 'bold' }}>
        TSh {displayValue}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: entry.color,
                flexShrink: 0,
              }}
            />
            <Text style={{ fontSize: '12px', color: '#666' }}>{entry.name}</Text>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card bordered={false} style={{ borderRadius: '12px', height: '100%' }} loading={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '16px' }}>
          Payments Breakdown
        </Text>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Select
            value={selectedYear}
            onChange={(value) => {
              setSelectedYear(value);
              setSelectedMonth(null);
            }}
            style={{ width: '100px' }}
            size="small"
            disabled={availableYears.length === 0}
            placeholder="Year"
          >
            {availableYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>

          <Select
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
            style={{ width: '100px' }}
            size="small"
            disabled={availableMonths.length === 0}
            placeholder="Month"
          >
            {availableMonths.map((month) => (
              <Option key={month} value={month}>
                {monthNames[parseInt(month)]}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {paymentData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            No payment data available for {selectedMonth ? monthNames[parseInt(selectedMonth)] : ''} {selectedYear}
          </Text>
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
    </Card>
  );
};

export default CostBreakdownChart;
