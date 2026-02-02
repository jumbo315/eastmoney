import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { fetchStockMargin } from '../../api';
import type { MarginData } from '../../api';

interface MarginTabProps {
  code: string;
}

export default function MarginTab({ code }: MarginTabProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<MarginData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStockMargin(code);
        setData(result);
      } catch (err) {
        setError(t('stocks.professional.load_error'));
        console.error('Failed to load margin data:', err);
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

  const formatMoney = (val?: number) => {
    if (val == null) return '---';
    if (val >= 100000000) return `${(val / 100000000).toFixed(2)}${t('stocks.margin.unit_yi')}`;
    if (val >= 10000) return `${(val / 10000).toFixed(2)}${t('stocks.margin.unit_wan')}`;
    return val.toLocaleString();
  };

  // Prepare chart data
  const chartData = data.margin_data
    .slice()
    .reverse()
    .map(d => ({
      date: d.trade_date?.substring(4) || '',
      rzye: d.rzye || 0,
      rqye: d.rqye || 0
    }));

  const renderDualAxisChart = () => {
    if (chartData.length < 2) return null;

    const rzyeValues = chartData.map(d => d.rzye);
    const rqyeValues = chartData.map(d => d.rqye);

    const rzyeMin = Math.min(...rzyeValues);
    const rzyeMax = Math.max(...rzyeValues);
    const rzyeRange = rzyeMax - rzyeMin || 1;

    const rqyeMin = Math.min(...rqyeValues);
    const rqyeMax = Math.max(...rqyeValues);
    const rqyeRange = rqyeMax - rqyeMin || 1;

    const width = 350;
    const height = 120;
    const padding = 15;

    const rzyePoints = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
      const y = (height - padding) - ((d.rzye - rzyeMin) / rzyeRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const rqyePoints = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
      const y = (height - padding) - ((d.rqye - rqyeMin) / rqyeRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 120 }}>
        {/* Financing balance line (red/bullish) */}
        <polyline
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={rzyePoints}
        />
        {/* Securities lending balance line (green/bearish) */}
        <polyline
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 2"
          points={rqyePoints}
        />
      </svg>
    );
  };

  const getSentimentColor = (signal?: string) => {
    if (signal === 'bullish') return '#ef4444';
    if (signal === 'bearish') return '#22c55e';
    return '#64748b';
  };

  const getSentimentBg = (signal?: string) => {
    if (signal === 'bullish') return '#ef444420';
    if (signal === 'bearish') return '#22c55e20';
    return '#64748b20';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Sentiment Card */}
      {data.sentiment && (
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '12px',
                bgcolor: getSentimentBg(data.sentiment.signal),
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShowChartIcon sx={{ color: getSentimentColor(data.sentiment.signal), fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>
                  {t('stocks.margin.leverage_sentiment')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: getSentimentColor(data.sentiment.signal) }}>
                  {data.sentiment.financing_ratio.toFixed(1)}x
                </Typography>
              </Box>
            </Box>
            <Chip
              label={data.sentiment.signal === 'bullish' ? t('stocks.margin.bullish') :
                     data.sentiment.signal === 'bearish' ? t('stocks.margin.bearish') : t('stocks.margin.neutral')}
              sx={{
                bgcolor: getSentimentBg(data.sentiment.signal),
                color: getSentimentColor(data.sentiment.signal),
                fontWeight: 800
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block' }}>
            {data.sentiment.description}
          </Typography>
        </Paper>
      )}

      {/* Balance Summary */}
      <Box>
        <Typography variant="overline" sx={{ color: '#0f172a', fontWeight: 900, mb: 2, display: 'block' }}>
          {t('stocks.margin.balance_summary')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
              <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 800 }}>
                {t('stocks.margin.financing_balance')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#dc2626', fontFamily: 'JetBrains Mono' }}>
                {formatMoney(data.summary.rzye)}
              </Typography>
              {data.summary.rzye_5d_change != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {data.summary.rzye_5d_change >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                  )}
                  <Typography variant="caption" sx={{
                    fontWeight: 700,
                    color: data.summary.rzye_5d_change >= 0 ? '#ef4444' : '#22c55e'
                  }}>
                    {data.summary.rzye_5d_change >= 0 ? '+' : ''}{data.summary.rzye_5d_change.toFixed(2)}% {t('stocks.margin.5d')}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 800 }}>
                {t('stocks.margin.lending_balance')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#16a34a', fontFamily: 'JetBrains Mono' }}>
                {formatMoney(data.summary.rqye)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                {t('stocks.margin.financing_buy')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                {formatMoney(data.summary.rzmre)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                {t('stocks.margin.lending_sell')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                {formatMoney(data.summary.rqmcl)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <Box>
          <Typography variant="overline" sx={{ color: '#0f172a', fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartIcon sx={{ fontSize: 18, color: '#6366f1' }} />
            {t('stocks.margin.trend_30d')}
          </Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#fcfcfc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            {renderDualAxisChart()}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 3, bgcolor: '#ef4444', borderRadius: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  {t('stocks.margin.financing_balance')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 3, bgcolor: '#22c55e', borderRadius: 1, borderStyle: 'dashed', borderWidth: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  {t('stocks.margin.lending_balance')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Data Update Time */}
      {data.summary.trade_date && (
        <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center' }}>
          {t('stocks.margin.last_update')}: {data.summary.trade_date}
        </Typography>
      )}
    </Box>
  );
}
