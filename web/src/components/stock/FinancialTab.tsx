import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { fetchStockFinancials } from '../../api';
import type { FinancialData } from '../../api';

interface FinancialTabProps {
  code: string;
}

export default function FinancialTab({ code }: FinancialTabProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStockFinancials(code);
        setData(result);
      } catch (err) {
        setError(t('stocks.professional.load_error'));
        console.error('Failed to load financial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [code, t]);

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ color: '#6366f1' }} />
        <Typography sx={{ mt: 2, color: '#64748b' }}>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">{error || t('stocks.professional.no_data')}</Typography>
      </Box>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 20) return '#22c55e';
    if (score >= 15) return '#84cc16';
    if (score >= 10) return '#eab308';
    return '#ef4444';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 20) return t('stocks.financial.health_excellent');
    if (score >= 15) return t('stocks.financial.health_good');
    if (score >= 10) return t('stocks.financial.health_fair');
    return t('stocks.financial.health_poor');
  };

  const formatPercent = (val?: number) => val != null ? `${val.toFixed(2)}%` : '---';
  const formatNumber = (val?: number) => val != null ? val.toFixed(2) : '---';

  // Prepare ROE trend data for chart
  const roeTrend = data.indicators
    .slice()
    .reverse()
    .map(ind => ({
      period: ind.end_date?.substring(0, 6) || '',
      value: ind.roe || 0
    }));

  const renderMiniTrendChart = (dataPoints: { period: string; value: number }[]) => {
    if (dataPoints.length < 2) return null;
    const values = dataPoints.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 300;
    const height = 80;
    const padding = 10;

    const points = dataPoints.map((d, i) => {
      const x = (i / (dataPoints.length - 1)) * (width - 2 * padding) + padding;
      const y = (height - padding) - ((d.value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 80 }}>
        <polyline
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <path
          d={`M${padding},${height - padding} L${points} L${width - padding},${height - padding} Z`}
          fill="rgba(99, 102, 241, 0.1)"
        />
      </svg>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Health Score Card */}
      {data.health_score != null && (
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '12px',
                bgcolor: getHealthColor(data.health_score) + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AccountBalanceIcon sx={{ color: getHealthColor(data.health_score), fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>
                  {t('stocks.financial.health_score')}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: getHealthColor(data.health_score) }}>
                  {data.health_score.toFixed(1)}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={getHealthLabel(data.health_score)}
              sx={{
                bgcolor: getHealthColor(data.health_score) + '20',
                color: getHealthColor(data.health_score),
                fontWeight: 800
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Key Metrics Grid */}
      <Box>
        <Typography variant="overline" sx={{ color: '#0f172a', fontWeight: 900, mb: 2, display: 'block' }}>
          {t('stocks.financial.key_metrics')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>ROE</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: (data.summary.roe || 0) >= 15 ? '#22c55e' : '#0f172a' }}>
                {formatPercent(data.summary.roe)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>{t('stocks.financial.net_margin')}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {formatPercent(data.summary.netprofit_margin)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>{t('stocks.financial.gross_margin')}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {formatPercent(data.summary.grossprofit_margin)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>{t('stocks.financial.debt_ratio')}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: (data.summary.debt_to_assets || 0) > 60 ? '#ef4444' : '#0f172a' }}>
                {formatPercent(data.summary.debt_to_assets)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>{t('stocks.financial.current_ratio')}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: (data.summary.current_ratio || 0) < 1 ? '#ef4444' : '#0f172a' }}>
                {formatNumber(data.summary.current_ratio)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>EPS</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {formatNumber(data.summary.eps)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ROE Trend Chart */}
      {roeTrend.length > 1 && (
        <Box>
          <Typography variant="overline" sx={{ color: '#0f172a', fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: '#6366f1' }} />
            {t('stocks.financial.roe_trend')}
          </Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#fcfcfc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            {renderMiniTrendChart(roeTrend)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              {roeTrend.map((d, i) => (
                <Typography key={i} variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                  {d.period}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Profitability Indicators */}
      {data.indicators.length > 0 && (
        <Box>
          <Typography variant="overline" sx={{ color: '#0f172a', fontWeight: 900, mb: 2, display: 'block' }}>
            {t('stocks.financial.profitability')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.indicators.slice(0, 4).map((ind, i) => (
              <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
                    {ind.end_date?.substring(0, 4)}-Q{Math.ceil(parseInt(ind.end_date?.substring(4, 6) || '3') / 3)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>ROE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                        {formatPercent(ind.roe)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>{t('stocks.financial.yoy_growth')}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {(ind.op_yoy || 0) >= 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                        )}
                        <Typography variant="body2" sx={{
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono',
                          color: (ind.op_yoy || 0) >= 0 ? '#22c55e' : '#ef4444'
                        }}>
                          {formatPercent(ind.op_yoy)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
