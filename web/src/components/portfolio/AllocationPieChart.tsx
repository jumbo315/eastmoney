import { Paper, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];

interface AllocationPieChartProps {
  allocationByType: Record<string, number>;
  allocationBySector: Record<string, number>;
}

export default function AllocationPieChart({ allocationByType, allocationBySector }: AllocationPieChartProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<'type' | 'sector'>('type');

  const typeLabels: Record<string, string> = {
    stock: t('portfolio.stock_type'),
    fund: t('portfolio.fund_type'),
  };

  const typeData = Object.entries(allocationByType)
    .filter(([, value]) => value > 0)
    .map(([key, value], idx) => ({
      name: typeLabels[key] || key,
      value: Number(value.toFixed(2)),
      color: COLORS[idx % COLORS.length],
    }));

  const sectorData = Object.entries(allocationBySector)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, value], idx) => ({
      name: key,
      value: Number(value.toFixed(2)),
      color: COLORS[idx % COLORS.length],
    }));

  const data = view === 'type' ? typeData : sectorData;

  return (
    <Paper sx={{ p: 2, borderRadius: '12px', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('portfolio.allocation')}
        </Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
        >
          <ToggleButton value="type" sx={{ textTransform: 'none', px: 1.5 }}>
            {t('portfolio.by_type')}
          </ToggleButton>
          <ToggleButton value="sector" sx={{ textTransform: 'none', px: 1.5 }}>
            {t('portfolio.by_sector')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {data.length > 0 ? (
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                label={({ name, value }) => `${(name || '').slice(0, 6)} ${value}%`}
                labelLine={{ stroke: '#94a3b8' }}
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          {t('portfolio.no_allocation')}
        </Typography>
      )}
    </Paper>
  );
}
