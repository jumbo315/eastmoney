import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from 'recharts';

interface SparklineChartProps {
  data: number[];
  dates?: string[];
  width?: number | string;
  height?: number;
  color?: 'success' | 'error' | 'primary' | 'auto';
  showArea?: boolean;
  animate?: boolean;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  dates = [],
  width = '100%',
  height = 40,
  color = 'auto',
  showArea = true,
  animate = true,
}) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          fontSize: '0.75rem',
        }}
      >
        --
      </Box>
    );
  }

  // Determine trend color
  const getColor = () => {
    if (color !== 'auto') {
      const colorMap = {
        success: theme.palette.success.main,
        error: theme.palette.error.main,
        primary: theme.palette.primary.main,
      };
      return colorMap[color];
    }

    // Auto determine based on trend
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    return lastValue >= firstValue
      ? theme.palette.success.main
      : theme.palette.error.main;
  };

  const lineColor = getColor();
  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Format data for Recharts
  const chartData = data.map((value, index) => ({
    value,
    date: dates[index] || index.toString(),
  }));

  // Calculate domain with some padding
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <Box sx={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            hide
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            fill={showArea ? `url(#${gradientId})` : 'transparent'}
            isAnimationActive={animate}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SparklineChart;
