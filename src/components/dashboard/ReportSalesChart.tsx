import React, { useState, useMemo } from 'react';
import { Card, Select, Switch, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Text } = Typography;
const { Option } = Select;

interface ReportSalesChartProps {
  data: any;
  loading: boolean;
}

const ReportSalesChart: React.FC<ReportSalesChartProps> = ({ data: dashboardData, loading }) => {
  const getAvailableYears = () => {
    if (!dashboardData || !dashboardData.monthly_revenue_collection) return [];
    return Object.keys(dashboardData.monthly_revenue_collection).sort((a, b) => Number(b) - Number(a));
  };

  const availableYears = getAvailableYears();
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears.length > 0 ? availableYears[0] : new Date().getFullYear().toString()
  );

  const generateData = () => {
    if (!dashboardData) return [];

    if (viewType === 'monthly') {
      const monthlyData = dashboardData.monthly_revenue_collection || {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearData = monthlyData[selectedYear] || {};

      return monthNames.map((monthName, index) => {
        const monthNum = (index + 1).toString();
        const monthNumPadded = monthNum.padStart(2, '0');
        const monthData = yearData[monthNum] || yearData[monthNumPadded] || { rent: 0, paid: 0 };

        return {
          day: monthName,
          billed: parseFloat(monthData.rent || 0),
          collected: parseFloat(monthData.paid || 0),
          fullDate: `${monthName} ${selectedYear}`,
        };
      });
    } else {
      const yearlyData = dashboardData.yearly_revenue_collection || {};
      const years = Object.keys(yearlyData)
        .map((y) => parseInt(y))
        .sort();

      return years.map((year) => {
        const yearStr = year.toString();
        const yearData = yearlyData[yearStr] || { rent: 0, paid: 0 };

        return {
          day: yearStr,
          billed: parseFloat(yearData.rent || 0),
          collected: parseFloat(yearData.paid || 0),
          fullDate: yearStr,
        };
      });
    }
  };

  const data = useMemo(() => generateData(), [dashboardData, viewType, selectedYear]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#1f2937',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '12px',
          }}
        >
          <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>{payload[0].payload.fullDate}</p>
          <p style={{ marginBottom: '4px', color: '#4ade80' }}>
            Billed: TSh {formatCurrency(payload[0].payload.billed)}
          </p>
          <p style={{ marginBottom: 0, color: '#60a5fa' }}>
            Collected: TSh {formatCurrency(payload[0].payload.collected)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card bordered={false} style={{ borderRadius: '12px', height: '100%' }} loading={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Text strong style={{ fontSize: '16px' }}>
            Rent Billed vs Rent Collected
          </Text>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#4ade80' }} />
              <Text style={{ fontSize: '12px', color: '#6B7280' }}>Billed</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#60a5fa' }} />
              <Text style={{ fontSize: '12px', color: '#6B7280' }}>Collected</Text>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ fontSize: '13px', color: '#6B7280' }}>Monthly</Text>
            <Switch
              checked={viewType === 'yearly'}
              onChange={(checked) => setViewType(checked ? 'yearly' : 'monthly')}
              size="small"
            />
            <Text style={{ fontSize: '13px', color: '#6B7280' }}>Yearly</Text>
          </div>

          {viewType === 'monthly' && availableYears.length > 0 && (
            <Select
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              style={{ width: '100px' }}
              size="small"
            >
              {availableYears.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Bar dataKey="billed" fill="#4ade80" radius={[8, 8, 0, 0]} maxBarSize={25} />
            <Bar dataKey="collected" fill="#60a5fa" radius={[8, 8, 0, 0]} maxBarSize={25} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ReportSalesChart;
