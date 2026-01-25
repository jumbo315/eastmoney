import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Link,
  Skeleton,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import type { NewsItem } from '../../api';

interface NewsDetailProps {
  news: NewsItem | null;
  analysis: any;
  loading: boolean;
  onToggleBookmark: (item: NewsItem) => void;
}

const sentimentConfig = {
  positive: { icon: TrendingUpIcon, color: '#22c55e', bgColor: '#dcfce7', labelZh: '积极', labelEn: 'Positive' },
  negative: { icon: TrendingDownIcon, color: '#ef4444', bgColor: '#fee2e2', labelZh: '消极', labelEn: 'Negative' },
  neutral: { icon: TrendingFlatIcon, color: '#64748b', bgColor: '#f1f5f9', labelZh: '中性', labelEn: 'Neutral' },
};

export default function NewsDetail({ news, analysis, loading, onToggleBookmark }: NewsDetailProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  if (!news) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
          color: '#94a3b8',
        }}
      >
        <ArticleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
        <Typography variant="body1">
          {isZh ? '选择一条资讯查看详情' : 'Select a news item to view details'}
        </Typography>
      </Box>
    );
  }

  const sentiment = analysis?.sentiment || news.sentiment;
  const sentimentInfo = sentiment ? sentimentConfig[sentiment as keyof typeof sentimentConfig] : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          url: news.url || window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(news.url || window.location.href);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            label={news.source_name || news.source}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            {news.published_at}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => onToggleBookmark(news)}>
              {news.is_bookmarked ? (
                <BookmarkIcon fontSize="small" sx={{ color: '#f59e0b' }} />
              ) : (
                <BookmarkBorderIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton size="small" onClick={handleShare}>
              <ShareIcon fontSize="small" />
            </IconButton>
            {news.url && (
              <IconButton size="small" component={Link} href={news.url} target="_blank">
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
          {news.title}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* AI Analysis Section */}
        {(loading || analysis) && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: '#fafafa',
              borderRadius: 2,
              border: '1px solid #f1f5f9',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {isZh ? 'AI 智能分析' : 'AI Analysis'}
              </Typography>
              {analysis?.cached && (
                <Chip label={isZh ? '缓存' : 'Cached'} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
              )}
            </Box>

            {loading ? (
              <Box>
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1, borderRadius: 1 }} />
              </Box>
            ) : analysis?.error ? (
              <Typography variant="body2" color="error">
                {analysis.error}
              </Typography>
            ) : (
              <>
                {/* Sentiment */}
                {sentimentInfo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor: sentimentInfo.bgColor,
                      }}
                    >
                      <sentimentInfo.icon sx={{ fontSize: 18, color: sentimentInfo.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: sentimentInfo.color }}>
                        {isZh ? sentimentInfo.labelZh : sentimentInfo.labelEn}
                      </Typography>
                    </Box>
                    {analysis?.sentiment_score !== undefined && (
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {isZh ? '置信度' : 'Score'}: {(analysis.sentiment_score * 100).toFixed(0)}%
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Summary */}
                {analysis?.summary && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      {isZh ? '一句话摘要' : 'Summary'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0f172a', lineHeight: 1.6 }}>
                      {analysis.summary}
                    </Typography>
                  </Box>
                )}

                {/* Key Points */}
                {analysis?.key_points && analysis.key_points.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      {isZh ? '核心要点' : 'Key Points'}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {analysis.key_points.map((point: string, idx: number) => (
                        <Box component="li" key={idx} sx={{ mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#334155' }}>
                            {point}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Related Stocks from Analysis */}
                {analysis?.related_stocks && analysis.related_stocks.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      {isZh ? '相关个股' : 'Related Stocks'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {analysis.related_stocks.map((stock: any, idx: number) => {
                        const label = typeof stock === 'string' ? stock : (stock.name || stock.code || 'Unknown');
                        const impact = typeof stock === 'object' ? stock.impact : undefined;
                        
                        return (
                          <Chip
                            key={idx}
                            label={label}
                            size="small"
                            color={impact === 'positive' ? 'success' : impact === 'negative' ? 'error' : 'default'}
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Original Content */}
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
          {isZh ? '原文内容' : 'Original Content'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#334155',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
          }}
        >
          {news.content || (isZh ? '暂无详细内容' : 'No content available')}
        </Typography>

        {/* Related Stocks from News */}
        {news.related_stocks && news.related_stocks.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
              {isZh ? '提及股票' : 'Mentioned Stocks'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {news.related_stocks.map((stock, idx) => (
                <Chip
                  key={idx}
                  label={`${stock.name || ''} ${stock.code}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      {news.url && (
        <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
          <Button
            fullWidth
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            href={news.url}
            target="_blank"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#6366f1',
                color: '#6366f1',
              },
            }}
          >
            {isZh ? '查看原文' : 'View Original'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
