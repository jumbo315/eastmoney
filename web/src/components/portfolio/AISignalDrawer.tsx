import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  ShowChart,
  AccountBalance,
  Mood,
  DonutSmall,
  Article,
  Lightbulb,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SignalFactor {
  name: string;
  signal: string;
  weight: number;
  details: string;
}

interface SignalDetail {
  code: string;
  name: string;
  signal_type: 'opportunity' | 'risk' | 'neutral';
  strength: number;
  reasons: string[];
  summary: string;
  explanation: string;
  action_suggestion: string;
  confidence: 'high' | 'medium' | 'low';
  factors: SignalFactor[];
  generated_at: string;
}

interface AISignalDrawerProps {
  open: boolean;
  onClose: () => void;
  signalDetail: SignalDetail | null;
  loading?: boolean;
}

const AISignalDrawer: React.FC<AISignalDrawerProps> = ({
  open,
  onClose,
  signalDetail,
  loading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!signalDetail && !loading) return null;

  const getSignalColor = () => {
    if (!signalDetail) return theme.palette.grey[500];
    switch (signalDetail.signal_type) {
      case 'opportunity': return theme.palette.success.main;
      case 'risk': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getSignalIcon = () => {
    if (!signalDetail) return <ShowChart />;
    switch (signalDetail.signal_type) {
      case 'opportunity': return <TrendingUp sx={{ color: theme.palette.success.main }} />;
      case 'risk': return <TrendingDown sx={{ color: theme.palette.error.main }} />;
      default: return <ShowChart sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getSignalLabel = () => {
    if (!signalDetail) return '--';
    switch (signalDetail.signal_type) {
      case 'opportunity': return t('portfolio.opportunitySignal', '机会信号');
      case 'risk': return t('portfolio.riskSignal', '风险信号');
      default: return t('portfolio.neutralSignal', '中性信号');
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.error.light;
      default: return theme.palette.grey[500];
    }
  };

  const getFactorIcon = (name: string) => {
    if (name.includes('技术')) return <ShowChart fontSize="small" />;
    if (name.includes('资金')) return <AccountBalance fontSize="small" />;
    if (name.includes('情绪')) return <Mood fontSize="small" />;
    if (name.includes('集中')) return <DonutSmall fontSize="small" />;
    if (name.includes('新闻')) return <Article fontSize="small" />;
    return <Lightbulb fontSize="small" />;
  };

  const getReasonLabel = (reason: string) => {
    const reasonLabels: Record<string, string> = {
      ma_bullish_cross: t('portfolio.maBullishCross', '均线金叉'),
      ma_bearish_cross: t('portfolio.maBearishCross', '均线死叉'),
      oversold: t('portfolio.oversold', 'RSI超卖'),
      overbought: t('portfolio.overbought', 'RSI超买'),
      below_ma20: t('portfolio.belowMa20', '跌破20日均线'),
      fund_inflow: t('portfolio.fundInflow', '资金净流入'),
      fund_outflow: t('portfolio.fundOutflow', '资金净流出'),
      sentiment_positive: t('portfolio.sentimentPositive', '情绪积极'),
      sentiment_negative: t('portfolio.sentimentNegative', '情绪消极'),
      high_correlation: t('portfolio.highCorrelation', '高相关性'),
      concentration_risk: t('portfolio.concentrationRisk', '集中风险'),
      news_negative: t('portfolio.newsNegative', '负面新闻'),
    };
    return reasonLabels[reason] || reason;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 0,
        },
      }}
    >
      {loading ? (
        <Box sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary" textAlign="center">
            {t('portfolio.analyzingSignal', '正在分析信号...')}
          </Typography>
        </Box>
      ) : signalDetail ? (
        <Box>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(getSignalColor(), 0.1),
              borderBottom: `1px solid ${alpha(getSignalColor(), 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSignalIcon()}
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {signalDetail.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {signalDetail.code}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={onClose}>
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip
                label={getSignalLabel()}
                size="small"
                sx={{
                  bgcolor: alpha(getSignalColor(), 0.2),
                  color: getSignalColor(),
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`${t('portfolio.confidence', '置信度')}: ${
                  signalDetail.confidence === 'high' ? t('portfolio.high', '高') :
                  signalDetail.confidence === 'medium' ? t('portfolio.medium', '中') :
                  t('portfolio.low', '低')
                }`}
                size="small"
                sx={{
                  bgcolor: alpha(getConfidenceColor(signalDetail.confidence), 0.1),
                  color: getConfidenceColor(signalDetail.confidence),
                }}
              />
            </Box>
          </Box>

          {/* Summary */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('portfolio.summary', '摘要')}
            </Typography>
            <Typography variant="body2">
              {signalDetail.summary}
            </Typography>
          </Box>

          <Divider />

          {/* Explanation */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('portfolio.detailedAnalysis', '详细分析')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-line',
                p: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              {signalDetail.explanation}
            </Typography>
          </Box>

          <Divider />

          {/* Signal Reasons */}
          {signalDetail.reasons.length > 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('portfolio.signalReasons', '信号触发因素')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {signalDetail.reasons.map((reason, index) => (
                  <Chip
                    key={index}
                    size="small"
                    label={getReasonLabel(reason)}
                    icon={
                      signalDetail.signal_type === 'opportunity' ?
                        <CheckCircle sx={{ fontSize: '0.9rem !important' }} /> :
                        signalDetail.signal_type === 'risk' ?
                          <Warning sx={{ fontSize: '0.9rem !important' }} /> :
                          undefined
                    }
                    sx={{
                      bgcolor: alpha(getSignalColor(), 0.1),
                      color: getSignalColor(),
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Factor Breakdown */}
          {signalDetail.factors.length > 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('portfolio.factorBreakdown', '因子分解')}
              </Typography>
              <List dense>
                {signalDetail.factors.map((factor, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getFactorIcon(factor.name)}
                    </ListItemIcon>
                    <ListItemText
                      primary={factor.name}
                      secondary={factor.details}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Chip
                      size="small"
                      label={
                        factor.signal === 'bullish' || factor.signal === 'positive' || factor.signal === 'ok' ?
                          t('portfolio.positive', '积极') :
                        factor.signal === 'bearish' || factor.signal === 'negative' || factor.signal === 'risk' ?
                          t('portfolio.negative', '消极') :
                          t('portfolio.neutral', '中性')
                      }
                      sx={{
                        bgcolor: alpha(
                          factor.signal === 'bullish' || factor.signal === 'positive' || factor.signal === 'ok' ?
                            theme.palette.success.main :
                          factor.signal === 'bearish' || factor.signal === 'negative' || factor.signal === 'risk' ?
                            theme.palette.error.main :
                            theme.palette.grey[500],
                          0.1
                        ),
                        color:
                          factor.signal === 'bullish' || factor.signal === 'positive' || factor.signal === 'ok' ?
                            theme.palette.success.main :
                          factor.signal === 'bearish' || factor.signal === 'negative' || factor.signal === 'risk' ?
                            theme.palette.error.main :
                            theme.palette.grey[500],
                        fontSize: '0.7rem',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Divider />

          {/* Action Suggestion */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('portfolio.actionSuggestion', '操作建议')}
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha(getSignalColor(), 0.05),
                borderRadius: 1,
                border: `1px solid ${alpha(getSignalColor(), 0.2)}`,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {signalDetail.action_suggestion}
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('portfolio.generatedAt', '生成时间')}: {new Date(signalDetail.generated_at).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Drawer>
  );
};

export default AISignalDrawer;
