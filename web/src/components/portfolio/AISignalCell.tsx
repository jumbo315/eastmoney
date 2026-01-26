import React from 'react';
import { Box, Tooltip, useTheme, alpha, IconButton } from '@mui/material';
import { Brightness1 } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AISignalCellProps {
  signalType: 'opportunity' | 'risk' | 'neutral';
  strength?: number;
  summary?: string;
  onClick?: () => void;
}

const AISignalCell: React.FC<AISignalCellProps> = ({
  signalType,
  strength = 0.5,
  summary,
  onClick,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getSignalConfig = () => {
    switch (signalType) {
      case 'opportunity':
        return {
          color: theme.palette.success.main,
          label: t('portfolio.opportunity', '机会'),
          icon: '🟢',
          description: t('portfolio.opportunitySignal', '存在买入机会'),
        };
      case 'risk':
        return {
          color: theme.palette.error.main,
          label: t('portfolio.risk', '风险'),
          icon: '🔴',
          description: t('portfolio.riskSignal', '存在风险信号'),
        };
      case 'neutral':
      default:
        return {
          color: theme.palette.grey[400],
          label: t('portfolio.neutral', '中性'),
          icon: '⚪',
          description: t('portfolio.neutralSignal', '暂无明显信号'),
        };
    }
  };

  const config = getSignalConfig();

  const getStrengthOpacity = () => {
    if (signalType === 'neutral') return 0.3;
    return 0.3 + strength * 0.7;
  };

  return (
    <Tooltip
      title={
        <Box>
          <Box sx={{ fontWeight: 600, mb: 0.5 }}>{config.label}</Box>
          <Box sx={{ fontSize: '0.85em' }}>{summary || config.description}</Box>
          {signalType !== 'neutral' && (
            <Box sx={{ fontSize: '0.8em', mt: 0.5, opacity: 0.8 }}>
              {t('portfolio.signalStrength', '信号强度')}: {(strength * 100).toFixed(0)}%
            </Box>
          )}
          <Box sx={{ fontSize: '0.8em', mt: 0.5, color: theme.palette.primary.light }}>
            {t('portfolio.clickForDetails', '点击查看详情')}
          </Box>
        </Box>
      }
      arrow
    >
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          p: 0.5,
          '&:hover': {
            backgroundColor: alpha(config.color, 0.1),
          },
        }}
      >
        <Brightness1
          sx={{
            fontSize: 20,
            color: config.color,
            opacity: getStrengthOpacity(),
            filter: signalType !== 'neutral' ? `drop-shadow(0 0 ${strength * 4}px ${config.color})` : 'none',
            transition: 'all 0.3s ease',
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

export default AISignalCell;
