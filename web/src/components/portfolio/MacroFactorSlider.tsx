import React from 'react';
import { Box, Slider, Typography, useTheme, alpha } from '@mui/material';

interface MacroFactorSliderProps {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description?: string;
  onChange: (id: string, value: number) => void;
  disabled?: boolean;
}

const MacroFactorSlider: React.FC<MacroFactorSliderProps> = ({
  id,
  name,
  value,
  min,
  max,
  step,
  unit,
  description,
  onChange,
  disabled = false,
}) => {
  const theme = useTheme();

  const getColor = () => {
    if (value === 0) return theme.palette.text.secondary;
    if (value > 0) return theme.palette.success.main;
    return theme.palette.error.main;
  };

  const handleChange = (_: Event, newValue: number | number[]) => {
    onChange(id, newValue as number);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" fontWeight={500}>
          {name}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: getColor(),
            minWidth: 60,
            textAlign: 'right',
            fontFamily: '"Roboto Mono", monospace',
          }}
        >
          {value > 0 ? '+' : ''}{value}{unit}
        </Typography>
      </Box>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        disabled={disabled}
        marks={[
          { value: min, label: `${min}${unit}` },
          { value: 0, label: '0' },
          { value: max, label: `${max}${unit}` },
        ]}
        sx={{
          color: getColor(),
          '& .MuiSlider-track': {
            background: value > 0
              ? `linear-gradient(90deg, ${alpha(theme.palette.grey[400], 0.3)}, ${theme.palette.success.main})`
              : value < 0
              ? `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.grey[400], 0.3)})`
              : alpha(theme.palette.grey[400], 0.3),
          },
          '& .MuiSlider-thumb': {
            backgroundColor: getColor(),
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px ${alpha(getColor(), 0.16)}`,
            },
          },
          '& .MuiSlider-mark': {
            backgroundColor: alpha(theme.palette.text.secondary, 0.3),
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.7rem',
            color: theme.palette.text.secondary,
          },
        }}
      />

      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default MacroFactorSlider;
