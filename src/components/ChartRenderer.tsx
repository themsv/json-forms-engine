import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, schemaMatches } from '@jsonforms/core';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ChartControl = ({ schema, uischema }: any) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartType = schema?.chartType || 'bar';
  const title = schema?.title || 'Chart';
  const data = schema?.data || [];

  const chartConfig = {
    stroke: isDark ? '#d1d5db' : '#374151',
    fill: isDark ? '#f3f4f6' : '#374151',
  };

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: '6px',
    color: isDark ? '#f9fafb' : '#111827',
  };

  const labelStyle = {
    fill: isDark ? '#f3f4f6' : '#374151',
    fontSize: '12px',
    fontWeight: 500,
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={chartConfig.stroke} style={labelStyle} />
              <YAxis stroke={chartConfig.stroke} style={labelStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: chartConfig.fill }} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={chartConfig.stroke} style={labelStyle} />
              <YAxis stroke={chartConfig.stroke} style={labelStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: chartConfig.fill }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                style={labelStyle}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={chartConfig.stroke} style={labelStyle} />
              <YAxis stroke={chartConfig.stroke} style={labelStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: chartConfig.fill }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

export const chartControlTester = rankWith(
  10,
  schemaMatches((schema) => schema.hasOwnProperty('chartType'))
);

export default withJsonFormsControlProps(ChartControl);
