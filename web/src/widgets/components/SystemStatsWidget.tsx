/**
 * System Stats Widget
 *
 * Displays report generation statistics.
 * Compact single-row layout for dashboard header.
 */

import { Box, Typography, Chip, Paper, IconButton, CircularProgress } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import type { WidgetProps } from '../types';
import { useWidgetData } from '../WidgetContainer';
import { fetchDashboardStats } from '../../api';

interface SystemStatsData {
    total: number;
    breakdown: {
        pre: number;
        post: number;
        sentiment: number;
        commodity: number;
    };
    latest?: string;
}

export default function SystemStatsWidget({ id, config, isEditing }: WidgetProps) {
    const { t, i18n } = useTranslation();
    const isZh = i18n.language === 'zh';

    const { data, loading, error, lastUpdated, refresh } = useWidgetData<SystemStatsData>(
        fetchDashboardStats,
        config.refreshInterval ? config.refreshInterval * 1000 : 300000
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

            {data && (
                <>
                    <StorageIcon sx={{ fontSize: 18 }} className="text-slate-300" />
                    <Typography className="font-bold text-slate-800 text-lg tabular-nums">
                        {data.total}
                    </Typography>
                    <Typography variant="caption" className="text-slate-400 text-[10px]">
                        {isZh ? '文件' : 'Files'}
                    </Typography>
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
