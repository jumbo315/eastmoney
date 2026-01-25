/**
 * Market Sentiment Widget
 *
 * Displays market breadth (up/down counts, limit up/down).
 * Compact single-row layout for dashboard header.
 */

import { Box, Typography, Paper, IconButton, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import type { WidgetProps } from '../types';
import { useWidgetData } from '../WidgetContainer';
import { fetchDashboardOverview } from '../../api';

interface MarketOverviewData {
    market_overview?: {
        breadth?: {
            up: number;
            down: number;
            flat: number;
            limit_up: number;
            limit_down: number;
        };
        turnover?: {
            total: number;
        };
    };
}

export default function MarketSentimentWidget({ id, config, isEditing }: WidgetProps) {
    const { t, i18n } = useTranslation();
    const isZh = i18n.language === 'zh';

    const { data, loading, error, lastUpdated, refresh } = useWidgetData<MarketOverviewData>(
        fetchDashboardOverview,
        config.refreshInterval ? config.refreshInterval * 1000 : 60000
    );

    const breadth = data?.market_overview?.breadth || { up: 0, down: 0, flat: 0, limit_up: 0, limit_down: 0 };
    const total = (breadth.up + breadth.down + breadth.flat) || 1;
    const upPct = (breadth.up / total) * 100;
    const downPct = (breadth.down / total) * 100;

    return (
        <Paper
            elevation={0}
            className="h-full flex items-center bg-white border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 px-3 gap-3 overflow-hidden group"
            sx={{ borderRadius: 3 }}
        >
            {loading && !data && (
                <Box className="flex-1 flex items-center justify-center">
                    <CircularProgress size={16} className="text-slate-400" />
                </Box>
            )}

            {data && (
                <>
                    {/* Sentiment Bar (vertical) */}
                    <Box className="w-1.5 h-8 flex flex-col rounded-full overflow-hidden bg-slate-100">
                        <Box sx={{ height: `${upPct}%` }} className="bg-red-500 transition-all duration-500" />
                        <Box sx={{ flexGrow: 1 }} className="bg-slate-200" />
                        <Box sx={{ height: `${downPct}%` }} className="bg-green-500 transition-all duration-500" />
                    </Box>

                    {/* Up Stats */}
                    <Box className="flex items-center gap-1.5">
                        <TrendingUpIcon sx={{ fontSize: 16 }} className="text-red-500" />
                        <Typography className="font-bold text-red-600 text-base tabular-nums">
                            {breadth.up}
                        </Typography>
                        <span className="text-[10px] px-1 py-0.5 bg-red-100 text-red-700 rounded font-bold">
                            {isZh ? '涨停' : 'L↑'} {breadth.limit_up}
                        </span>
                    </Box>

                    {/* Divider */}
                    <Box className="w-px h-6 bg-slate-200" />

                    {/* Flat Stats */}
                    <Box className="flex items-center gap-1">
                        <Typography className="text-slate-400 text-sm tabular-nums">
                            {breadth.flat}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 text-[10px]">
                            {isZh ? '平' : 'Flat'}
                        </Typography>
                    </Box>

                    {/* Divider */}
                    <Box className="w-px h-6 bg-slate-200" />

                    {/* Down Stats */}
                    <Box className="flex items-center gap-1.5">
                        <TrendingDownIcon sx={{ fontSize: 16 }} className="text-green-500" />
                        <Typography className="font-bold text-green-600 text-base tabular-nums">
                            {breadth.down}
                        </Typography>
                        <span className="text-[10px] px-1 py-0.5 bg-green-100 text-green-700 rounded font-bold">
                            {isZh ? '跌停' : 'L↓'} {breadth.limit_down}
                        </span>
                    </Box>

                    {/* Turnover */}
                    {data?.market_overview?.turnover && (
                        <>
                            <Box className="w-px h-6 bg-slate-200" />
                            <Box className="flex items-center gap-1">
                                <Typography variant="caption" className="text-slate-400 text-[10px]">
                                    {isZh ? '成交' : 'Vol'}
                                </Typography>
                                <Typography className="text-slate-600 text-sm font-bold tabular-nums">
                                    {data.market_overview.turnover.total}
                                    <span className="text-[10px] text-slate-400 ml-0.5">{isZh ? '亿' : 'B'}</span>
                                </Typography>
                            </Box>
                        </>
                    )}
                </>
            )}

            {/* Refresh button */}
            <IconButton
                size="small"
                onClick={refresh}
                className="ml-auto w-6 h-6 text-slate-300 hover:text-slate-600 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Paper>
    );
}
