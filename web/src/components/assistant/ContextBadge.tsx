import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PlaceIcon from '@mui/icons-material/Place';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface ContextBadgeProps {
  stock?: { code: string; name: string } | null;
  fund?: { code: string; name: string } | null;
  page?: string;
  compact?: boolean;
}

const ContextBadge: React.FC<ContextBadgeProps> = ({
  stock,
  fund,
  page,
  compact = false,
}) => {
  const { t } = useTranslation();

  const hasContext = stock || fund;

  if (!hasContext && compact) {
    return null;
  }

  const pageLabels: Record<string, string> = {
    dashboard: t('layout.menu.dashboard', 'Dashboard'),
    stocks: t('layout.menu.stocks', 'Stocks'),
    funds: t('layout.menu.universe', 'Funds'),
    news: t('layout.menu.news', 'News'),
    recommendations: t('layout.menu.recommendations', 'AI Picks'),
    sentiment: t('layout.menu.sentiment', 'Sentiment'),
    commodities: t('layout.menu.commodities', 'Commodities'),
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {t('assistant.current_context', 'Context')}:
        </Typography>

        {/* Stock badge */}
        {stock && (
          <Chip
            icon={<ShowChartIcon sx={{ fontSize: 14 }} />}
            label={`${stock.name} (${stock.code})`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        )}

        {/* Fund badge */}
        {fund && (
          <Chip
            icon={<AccountBalanceIcon sx={{ fontSize: 14 }} />}
            label={`${fund.name} (${fund.code})`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        )}

        {/* Page badge if no specific context */}
        {!hasContext && page && (
          <Chip
            label={pageLabels[page] || page}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.75rem',
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default ContextBadge;
