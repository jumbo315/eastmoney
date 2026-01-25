import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { fetchStockEvents } from '../../api';
import type { EventData, UpcomingEvent } from '../../api';

interface EventsTabProps {
  code: string;
}

export default function EventsTab({ code }: EventsTabProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStockEvents(code);
        setData(result);
      } catch (err) {
        setError(t('stocks.professional.load_error'));
        console.error('Failed to load event data:', err);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'forecast': return <TrendingUpIcon sx={{ fontSize: 18 }} />;
      case 'unlock': return <LockOpenIcon sx={{ fontSize: 18 }} />;
      case 'dividend': return <CardGiftcardIcon sx={{ fontSize: 18 }} />;
      default: return <EventIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getEventColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { bg: '#22c55e20', color: '#22c55e' };
      case 'negative': return { bg: '#ef444420', color: '#ef4444' };
      case 'warning': return { bg: '#f59e0b20', color: '#f59e0b' };
      default: return { bg: '#64748b20', color: '#64748b' };
    }
  };

  const renderUpcomingEvents = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.upcoming_events.length === 0 ? (
        <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
          {t('stocks.events.no_upcoming')}
        </Typography>
      ) : (
        data.upcoming_events.map((event: UpcomingEvent, i: number) => {
          const colors = getEventColor(event.sentiment);
          return (
            <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '10px',
                  bgcolor: colors.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: colors.color,
                  flexShrink: 0
                }}>
                  {getEventIcon(event.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                      {formatDate(event.date)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                    {event.detail}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })
      )}
    </Box>
  );

  const renderForecasts = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.forecasts.length === 0 ? (
        <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
          {t('stocks.events.no_forecast')}
        </Typography>
      ) : (
        data.forecasts.slice(0, 8).map((forecast, i) => {
          const isPositive = ['预增', '扭亏', '续盈', '略增'].includes(forecast.type || '');
          return (
            <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {isPositive ? (
                    <TrendingUpIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {forecast.end_date?.substring(0, 4)}
                      {forecast.end_date && `-Q${Math.ceil(parseInt(forecast.end_date.substring(4, 6)) / 3)}`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {t('stocks.events.announced')}: {formatDate(forecast.ann_date)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={forecast.type || t('stocks.events.unknown')}
                    size="small"
                    sx={{
                      bgcolor: isPositive ? '#22c55e20' : '#ef444420',
                      color: isPositive ? '#22c55e' : '#ef4444',
                      fontWeight: 800,
                      fontSize: '0.7rem'
                    }}
                  />
                  {(forecast.p_change_min != null || forecast.p_change_max != null) && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                      {forecast.p_change_min?.toFixed(0) || '?'}% ~ {forecast.p_change_max?.toFixed(0) || '?'}%
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })
      )}
    </Box>
  );

  const renderUnlocks = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.share_unlock.length === 0 ? (
        <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
          {t('stocks.events.no_unlock')}
        </Typography>
      ) : (
        data.share_unlock.slice(0, 8).map((unlock, i) => {
          const today = new Date().toISOString().replace(/-/g, '').substring(0, 8);
          const isFuture = (unlock.float_date || '') >= today;
          return (
            <Paper key={i} elevation={0} sx={{
              p: 2,
              bgcolor: isFuture ? '#fef3c720' : '#fff',
              borderRadius: '10px',
              border: isFuture ? '1px solid #fde047' : '1px solid #f1f5f9'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {isFuture && <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 20 }} />}
                  <LockOpenIcon sx={{ color: isFuture ? '#f59e0b' : '#64748b', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isFuture ? '#92400e' : '#0f172a' }}>
                      {formatDate(unlock.float_date)}
                    </Typography>
                    {isFuture && (
                      <Chip label={t('stocks.events.upcoming')} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', bgcolor: '#f59e0b20', color: '#f59e0b' }} />
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                    {unlock.float_share != null ? `${(unlock.float_share / 10000).toFixed(2)}${t('stocks.events.unit_wan')}` : '---'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {unlock.float_ratio != null ? `${unlock.float_ratio.toFixed(2)}%` : '---'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })
      )}
    </Box>
  );

  const renderDividends = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.dividends.length === 0 ? (
        <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
          {t('stocks.events.no_dividend')}
        </Typography>
      ) : (
        data.dividends.slice(0, 8).map((div, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CardGiftcardIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {div.end_date?.substring(0, 4)} {t('stocks.events.fiscal_year')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {div.div_proc || t('stocks.events.announced')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                {div.cash_div_tax != null && div.cash_div_tax > 0 && (
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#8b5cf6', fontFamily: 'JetBrains Mono' }}>
                    {div.cash_div_tax.toFixed(2)} {t('stocks.events.yuan_per_share')}
                  </Typography>
                )}
                {div.stk_div != null && div.stk_div > 0 && (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {t('stocks.events.stock_div')}: {div.stk_div}
                  </Typography>
                )}
                {div.ex_date && (
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    {t('stocks.events.ex_date')}: {formatDate(div.ex_date)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tab Navigation */}
      <Tabs
        value={selectedTab}
        onChange={(_, val) => setSelectedTab(val)}
        sx={{ borderBottom: '1px solid #f1f5f9' }}
        TabIndicatorProps={{ sx: { bgcolor: '#6366f1' } }}
      >
        <Tab
          icon={<EventIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={t('stocks.events.tab_upcoming')}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 48 }}
        />
        <Tab
          icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={t('stocks.events.tab_forecast')}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 48 }}
        />
        <Tab
          icon={<LockOpenIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={t('stocks.events.tab_unlock')}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 48 }}
        />
        <Tab
          icon={<CardGiftcardIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={t('stocks.events.tab_dividend')}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 48 }}
        />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ minHeight: 200 }}>
        {selectedTab === 0 && renderUpcomingEvents()}
        {selectedTab === 1 && renderForecasts()}
        {selectedTab === 2 && renderUnlocks()}
        {selectedTab === 3 && renderDividends()}
      </Box>
    </Box>
  );
}
