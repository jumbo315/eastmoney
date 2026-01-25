/**
 * Market Indices Widget
 *
 * Displays major market indices with real-time prices and changes.
 * Compact single-row layout for dashboard header.
 */

import { Box, Typography, Paper, IconButton, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import type { WidgetProps } from '../types';
import { useWidgetData } from '../WidgetContainer';
import { fetchMarketIndices } from '../../api';
import type { IndexData } from '../../api';

export default function MarketIndicesWidget({ id, config, isEditing }: WidgetProps) {
    const { t } = useTranslation();

    const { data, loading, error, lastUpdated, refresh } = useWidgetData<IndexData[]>(
        fetchMarketIndices,
        config.refreshInterval ? config.refreshInterval * 1000 : 60000
    );

    return (
        <Paper
            elevation={0}
            className="h-full flex items-center bg-white border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 px-3 gap-2 overflow-hidden group"
            sx={{ borderRadius: 3 }}
        >
            {loading && !data && (
                <Box className="flex-1 flex items-center justify-center">
                    <CircularProgress size={16} className="text-slate-400" />
                </Box>
            )}

            {data?.map((idx, index) => (
                <Box
                    key={idx.code}
                    className={`flex items-center gap-2 py-1 px-2 rounded-md hover:bg-slate-50 transition-colors ${
                        index < data.length - 1 ? 'border-r border-slate-100 pr-3' : ''
                    }`}
                >
                    <Typography variant="caption" className="text-slate-500 font-bold text-[11px] whitespace-nowrap">
                        {idx.name}
                    </Typography>
                    <Typography className="font-bold text-slate-800 text-sm whitespace-nowrap tabular-nums">
                        {idx.price?.toLocaleString()}
                    </Typography>
                    <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap tabular-nums ${
                            idx.change_pct >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}
                    >
                        {idx.change_pct >= 0 ? '+' : ''}{idx.change_pct?.toFixed(2)}%
                    </span>
                </Box>
            ))}

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
