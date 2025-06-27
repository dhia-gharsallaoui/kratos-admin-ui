import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimplePieChartProps {
  data: DataPoint[];
  title: string;
  size?: number;
}

const defaultColors = [
  '#0075ff',
  '#009688',
  '#ff9800',
  '#f44336',
  '#9c27b0',
  '#4caf50',
  '#ff5722',
  '#607d8b'
];

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  title,
  size = 200,
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const center = size / 2;

  let currentAngle = -90; // Start from top

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const color = item.color || defaultColors[index % defaultColors.length];

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      pathData,
      color,
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Pie Chart */}
        <Box>
          <svg width={size} height={size}>
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
        </Box>
        
        {/* Legend */}
        <Box sx={{ minWidth: 200 }}>
          <List dense>
            {slices.map((slice, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Circle sx={{ color: slice.color, fontSize: 12 }} />
                </ListItemIcon>
                <ListItemText
                  primary={slice.label}
                  secondary={`${slice.value} (${slice.percentage}%)`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};
