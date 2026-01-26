import React from 'react';
import { Box, Button, Typography, useTheme, alpha, Chip } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CurrencyYuan,
  ShowChart,
  Memory,
  LocalGasStation,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface ScenarioPresetsProps {
  scenarios: Scenario[];
  selectedScenario: string | null;
  onSelect: (scenarioId: string) => void;
  disabled?: boolean;
}

const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({
  scenarios,
  selectedScenario,
  onSelect,
  disabled = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending_up':
        return <TrendingUp fontSize="small" />;
      case 'trending_down':
        return <TrendingDown fontSize="small" />;
      case 'currency_yuan':
        return <CurrencyYuan fontSize="small" />;
      case 'show_chart':
        return <ShowChart fontSize="small" />;
      case 'memory':
        return <Memory fontSize="small" />;
      case 'local_gas_station':
        return <LocalGasStation fontSize="small" />;
      default:
        return <ShowChart fontSize="small" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'monetary_policy':
        return theme.palette.primary.main;
      case 'currency':
        return theme.palette.warning.main;
      case 'market':
        return theme.palette.error.main;
      case 'sector':
        return theme.palette.info.main;
      case 'commodity':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'monetary_policy':
        return t('portfolio.monetaryPolicy', '货币政策');
      case 'currency':
        return t('portfolio.currency', '汇率');
      case 'market':
        return t('portfolio.market', '市场');
      case 'sector':
        return t('portfolio.sector', '板块');
      case 'commodity':
        return t('portfolio.commodity', '大宗商品');
      default:
        return category;
    }
  };

  // Group scenarios by category
  const groupedScenarios = scenarios.reduce((acc, scenario) => {
    if (!acc[scenario.category]) {
      acc[scenario.category] = [];
    }
    acc[scenario.category].push(scenario);
    return acc;
  }, {} as Record<string, Scenario[]>);

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {t('portfolio.presetScenarios', '预设情景')}
      </Typography>

      {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => (
        <Box key={category} sx={{ mb: 2 }}>
          <Chip
            size="small"
            label={getCategoryLabel(category)}
            sx={{
              mb: 1,
              bgcolor: alpha(getCategoryColor(category), 0.1),
              color: getCategoryColor(category),
              fontSize: '0.7rem',
            }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categoryScenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant={selectedScenario === scenario.id ? 'contained' : 'outlined'}
                size="small"
                startIcon={getIcon(scenario.icon)}
                onClick={() => onSelect(scenario.id)}
                disabled={disabled}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: selectedScenario === scenario.id
                    ? getCategoryColor(scenario.category)
                    : alpha(theme.palette.divider, 0.5),
                  bgcolor: selectedScenario === scenario.id
                    ? getCategoryColor(scenario.category)
                    : 'transparent',
                  color: selectedScenario === scenario.id
                    ? 'white'
                    : theme.palette.text.primary,
                  '&:hover': {
                    borderColor: getCategoryColor(scenario.category),
                    bgcolor: selectedScenario === scenario.id
                      ? getCategoryColor(scenario.category)
                      : alpha(getCategoryColor(scenario.category), 0.08),
                  },
                }}
              >
                {scenario.name}
              </Button>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ScenarioPresets;
