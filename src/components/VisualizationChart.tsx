
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart as RechartLineChart,
  Line,
  PieChart as RechartPieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface VisualizationChartProps {
  data: Record<string, any>[];
  chartType: string;
  xAxisKey: string;
  yAxisKey: string;
}

// A set of colors for the charts
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', 
  '#FFBB28', '#FF8042', '#8B5CF6', '#D946EF', '#F97316'
];

const VisualizationChart: React.FC<VisualizationChartProps> = ({ 
  data, 
  chartType, 
  xAxisKey, 
  yAxisKey 
}) => {
  // Process data based on chart type
  const processedData = useMemo(() => {
    if (!data || !xAxisKey) return [];

    // For pie charts, we need to aggregate the data
    if (chartType === 'pie') {
      const aggregatedData: Record<string, number> = {};
      
      data.forEach(item => {
        const key = String(item[xAxisKey] || 'Unknown');
        aggregatedData[key] = (aggregatedData[key] || 0) + 1;
      });
      
      return Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
    }

    // For other charts, we just need to make sure the data is properly formatted
    return data.map(item => ({
      [xAxisKey]: item[xAxisKey],
      [yAxisKey]: parseFloat(item[yAxisKey]) || 0,
      name: item[xAxisKey], // Adding name for tooltip
      value: parseFloat(item[yAxisKey]) || 0 // Adding value for tooltip
    }));
  }, [data, xAxisKey, yAxisKey, chartType]);

  // Fixed chart config to match ChartConfig type
  const chartConfig = {
    bar: { label: 'Bar Chart' },
    line: { label: 'Line Chart' },
    pie: { label: 'Pie Chart' },
    scatter: { label: 'Scatter Plot' }
  };

  if (!processedData.length) {
    return <div>No data available for visualization</div>;
  }

  // Render the appropriate chart based on chartType
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis dataKey={yAxisKey} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey={yAxisKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" />
            </RechartLineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                dataKey="value"
                nameKey="name"
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={(entry) => entry.name}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} name={xAxisKey} />
              <YAxis dataKey={yAxisKey} name={yAxisKey} />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Scatter name="Data" data={processedData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <ChartContainer 
      className="w-full h-full" 
      config={chartConfig}
    >
      {renderChart()}
    </ChartContainer>
  );
};

export default VisualizationChart;
