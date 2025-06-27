import React from 'react';
import { Box, Typography } from '@mui/material';

interface DataPoint {
  date: string;
  count: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
}

const formatDateLabel = (dateStr: string) => {
  // Handle both YYYY-MM-DD and YYYY-MM formats
  if (dateStr.includes('-') && dateStr.split('-').length === 2) {
    // Monthly format (YYYY-MM)
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else {
    // Daily format (YYYY-MM-DD)
    return new Date(dateStr).toLocaleDateString();
  }
};

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  color = '#0075ff',
  height = 200,
}) => {
  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count));
  const minValue = Math.min(...data.map(d => d.count));
  const range = maxValue - minValue || 1;

  // Create SVG path
  const width = Math.max(400, height * 1.5); // Make width proportional to height for better aspect ratio
  const padding = 30; // Increase padding for larger charts
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.count - minValue) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points.split(' ').join(' L ')}`;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: height, position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
          
          {/* Chart area background */}
          <rect
            x={padding}
            y={padding}
            width={chartWidth}
            height={chartHeight}
            fill="rgba(0, 117, 255, 0.05)"
            stroke="#e0e0e0"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.count - minValue) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Y-axis labels */}
          <text x="15" y={padding + 5} fontSize="14" fill="#666">
            {maxValue}
          </text>
          <text x="15" y={height - padding + 5} fontSize="14" fill="#666">
            {minValue}
          </text>
        </svg>
        
        {/* X-axis labels */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: `${padding}px` }}>
          <Typography variant="caption" color="text.secondary">
            {data[0]?.date ? formatDateLabel(data[0].date) : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data[data.length - 1]?.date ? formatDateLabel(data[data.length - 1].date) : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};