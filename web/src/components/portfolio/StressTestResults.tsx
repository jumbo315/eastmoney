import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  TrendingDown,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import AnimatedNumber from './AnimatedNumber';

interface TopLoser {
  code: string;
  name: string;
  projected_change: number;
  impact_pct: number;
}

interface StressTestResultsProps {
  projectedPnl: number;
  projectedPnlPct: number;
  var95: number;
  var95Pct: number;
  topLosers: TopLoser[];
  topGainers?: TopLoser[];
  riskLevel: string;
  loading?: boolean;
}

const StressTestResults: React.FC<StressTestResultsProps> = ({
  projectedPnl,
  projectedPnlPct,
  var95,
  var95Pct,
  topLosers,
  topGainers = [],
  riskLevel,
  loading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case 'critical': return theme.palette.error.dark;
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.light;
      case 'positive': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getRiskLevelIcon = () => {
    switch (riskLevel) {
      case 'critical':
      case 'high':
        return <Error sx={{ color: getRiskLevelColor() }} />;
      case 'medium':
        return <Warning sx={{ color: getRiskLevelColor() }} />;
      case 'low':
      case 'positive':
        return <CheckCircle sx={{ color: getRiskLevelColor() }} />;
      default:
        return null;
    }
  };

  const getRiskLevelLabel = () => {
    switch (riskLevel) {
      case 'critical': return t('portfolio.criticalRisk', '极高风险');
      case 'high': return t('portfolio.highRisk', '高风险');
      case 'medium': return t('portfolio.mediumRisk', '中等风险');
      case 'low': return t('portfolio.lowRisk', '低风险');
      case 'positive': return t('portfolio.positive', '正面影响');
      default: return '--';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
        }}
      >
        <Typography color="text.secondary">
          {t('portfolio.calculating', '计算中...')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Main metrics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 3,
        }}
      >
        {/* Projected P&L */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: alpha(
              projectedPnl >= 0 ? theme.palette.success.main : theme.palette.error.main,
              0.05
            ),
            border: `1px solid ${alpha(
              projectedPnl >= 0 ? theme.palette.success.main : theme.palette.error.main,
              0.2
            )}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('portfolio.projectedPnl', '预测盈亏')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {projectedPnl >= 0 ? (
              <TrendingUp sx={{ color: theme.palette.success.main }} />
            ) : (
              <TrendingDown sx={{ color: theme.palette.error.main }} />
            )}
            <AnimatedNumber
              value={projectedPnl}
              prefix="¥"
              decimals={2}
              size="medium"
              color={projectedPnl >= 0 ? 'success' : 'error'}
              showSign
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: projectedPnl >= 0 ? 'success.main' : 'error.main',
              mt: 0.5,
            }}
          >
            ({projectedPnlPct >= 0 ? '+' : ''}{projectedPnlPct.toFixed(2)}%)
          </Typography>
        </Paper>

        {/* VaR */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('portfolio.var95', 'VaR (95%)')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: theme.palette.warning.main }} />
            <AnimatedNumber
              value={var95}
              prefix="¥"
              decimals={2}
              size="medium"
              color="inherit"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('portfolio.maxLoss', '最大可能损失')} {var95Pct.toFixed(2)}%
          </Typography>
        </Paper>
      </Box>

      {/* Risk Level Indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          p: 1.5,
          bgcolor: alpha(getRiskLevelColor(), 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(getRiskLevelColor(), 0.2)}`,
        }}
      >
        {getRiskLevelIcon()}
        <Typography variant="body2" fontWeight={500}>
          {t('portfolio.riskAssessment', '风险评估')}:
        </Typography>
        <Chip
          size="small"
          label={getRiskLevelLabel()}
          sx={{
            bgcolor: alpha(getRiskLevelColor(), 0.1),
            color: getRiskLevelColor(),
            fontWeight: 600,
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Top Losers */}
      {topLosers.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('portfolio.topLosers', '最受影响资产')}
          </Typography>
          <Table size="small">
            <TableBody>
              {topLosers.slice(0, 3).map((loser) => (
                <TableRow key={loser.code}>
                  <TableCell sx={{ border: 0, py: 0.5 }}>
                    <Typography variant="body2">{loser.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loser.code}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ border: 0, py: 0.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        color: loser.projected_change >= 0
                          ? 'success.main'
                          : 'error.main',
                      }}
                    >
                      {loser.projected_change >= 0 ? '+' : ''}
                      ¥{loser.projected_change.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: loser.impact_pct >= 0
                          ? 'success.main'
                          : 'error.main',
                      }}
                    >
                      {loser.impact_pct >= 0 ? '+' : ''}{loser.impact_pct.toFixed(2)}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Top Gainers (if any) */}
      {topGainers.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('portfolio.topGainers', '受益资产')}
          </Typography>
          <Table size="small">
            <TableBody>
              {topGainers.slice(0, 2).map((gainer) => (
                <TableRow key={gainer.code}>
                  <TableCell sx={{ border: 0, py: 0.5 }}>
                    <Typography variant="body2">{gainer.name}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ border: 0, py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      +¥{gainer.projected_change.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default StressTestResults;
