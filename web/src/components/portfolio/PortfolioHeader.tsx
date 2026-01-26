import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Shield,
  Speed,
  HealthAndSafety,
  ShowChart,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import AnimatedNumber from './AnimatedNumber';
import SparklineChart from './SparklineChart';

interface PortfolioHeaderProps {
  totalValue: number;
  totalPnl: number;
  totalPnlPct: number;
  sparklineData?: {
    values: number[];
    dates: string[];
    trend: 'up' | 'down' | 'flat';
  };
  beta?: number | null;
  betaStatus?: string;
  sharpeRatio?: number | null;
  sharpeStatus?: string;
  healthScore?: number;
  healthGrade?: string;
  loading?: boolean;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  totalValue,
  totalPnl,
  totalPnlPct,
  sparklineData,
  beta,
  betaStatus = 'unknown',
  sharpeRatio,
  sharpeStatus = 'unknown',
  healthScore = 50,
  healthGrade = 'N/A',
  loading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getBetaColor = () => {
    switch (betaStatus) {
      case 'low': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'high': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getSharpeColor = () => {
    switch (sharpeStatus) {
      case 'excellent': return theme.palette.success.main;
      case 'good': return theme.palette.success.light;
      case 'fair': return theme.palette.warning.main;
      case 'poor': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getHealthColor = () => {
    if (healthScore >= 80) return theme.palette.success.main;
    if (healthScore >= 60) return theme.palette.success.light;
    if (healthScore >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const TrendIcon = () => {
    if (!sparklineData) return <TrendingFlat />;
    switch (sparklineData.trend) {
      case 'up': return <TrendingUp sx={{ color: theme.palette.success.main }} />;
      case 'down': return <TrendingDown sx={{ color: theme.palette.error.main }} />;
      default: return <TrendingFlat sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' },
          gap: 3,
          alignItems: 'center',
        }}
      >
        {/* Total Value + Sparkline */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('portfolio.totalAssets', '总资产')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <AnimatedNumber
                value={totalValue}
                prefix="¥"
                decimals={2}
                size="large"
                color="primary"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <TrendIcon />
                <AnimatedNumber
                  value={totalPnl}
                  prefix="¥"
                  decimals={2}
                  size="small"
                  color={totalPnl >= 0 ? 'success' : 'error'}
                  showSign
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: totalPnlPct >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
            {sparklineData && sparklineData.values.length > 1 && (
              <Box sx={{ width: 100, height: 50 }}>
                <SparklineChart
                  data={sparklineData.values}
                  dates={sparklineData.dates}
                  height={50}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Portfolio Beta */}
        <Tooltip
          title={t('portfolio.betaTooltip', 'Beta 衡量组合相对大盘的波动性。Beta < 1 表示波动性低于大盘')}
          arrow
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', md: 'center' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ShowChart sx={{ color: getBetaColor(), fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {t('portfolio.beta', 'Beta')}
              </Typography>
            </Box>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{ color: getBetaColor() }}
                >
                  {beta !== null ? beta?.toFixed(2) : '--'}
                </Typography>
                <Chip
                  size="small"
                  label={
                    betaStatus === 'low' ? t('portfolio.defensive', '防御型') :
                    betaStatus === 'medium' ? t('portfolio.moderate', '稳健型') :
                    betaStatus === 'high' ? t('portfolio.aggressive', '进取型') :
                    '--'
                  }
                  sx={{
                    mt: 0.5,
                    bgcolor: alpha(getBetaColor(), 0.1),
                    color: getBetaColor(),
                  }}
                />
              </>
            )}
          </Box>
        </Tooltip>

        {/* Sharpe Ratio */}
        <Tooltip
          title={t('portfolio.sharpeTooltip', 'Sharpe 比率衡量风险调整后收益。数值越高表示单位风险获得的收益越高')}
          arrow
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', md: 'center' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Speed sx={{ color: getSharpeColor(), fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {t('portfolio.sharpe', 'Sharpe')}
              </Typography>
            </Box>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{ color: getSharpeColor() }}
                >
                  {sharpeRatio !== null ? sharpeRatio?.toFixed(2) : '--'}
                </Typography>
                <Chip
                  size="small"
                  label={
                    sharpeStatus === 'excellent' ? t('portfolio.excellent', '优秀') :
                    sharpeStatus === 'good' ? t('portfolio.good', '良好') :
                    sharpeStatus === 'fair' ? t('portfolio.fair', '一般') :
                    sharpeStatus === 'poor' ? t('portfolio.poor', '较差') :
                    '--'
                  }
                  sx={{
                    mt: 0.5,
                    bgcolor: alpha(getSharpeColor(), 0.1),
                    color: getSharpeColor(),
                  }}
                />
              </>
            )}
          </Box>
        </Tooltip>

        {/* Health Score */}
        <Tooltip
          title={t('portfolio.healthTooltip', '健康分综合评估组合的分散度、风险收益比、波动性等多个维度')}
          arrow
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', md: 'center' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <HealthAndSafety sx={{ color: getHealthColor(), fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {t('portfolio.healthScore', '健康分')}
              </Typography>
            </Box>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={healthScore}
                  size={60}
                  thickness={4}
                  sx={{
                    color: getHealthColor(),
                    backgroundColor: alpha(getHealthColor(), 0.1),
                    borderRadius: '50%',
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: getHealthColor() }}
                  >
                    {healthGrade}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default PortfolioHeader;
