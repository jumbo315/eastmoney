import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { UnifiedPosition } from '../../api';

interface PositionTableProps {
  positions: UnifiedPosition[];
  onDelete: (positionId: number) => void;
  onRecalculate?: (positionId: number) => void;
  loading?: boolean;
}

type SortField = 'asset_name' | 'current_value' | 'unrealized_pnl' | 'unrealized_pnl_pct' | 'total_shares';
type SortDir = 'asc' | 'desc';

export default function PositionTable({ positions, onDelete, onRecalculate, loading }: PositionTableProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'stock' | 'fund'>('all');
  const [sortField, setSortField] = useState<SortField>('current_value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = positions.filter((pos) => filter === 'all' || pos.asset_type === filter);

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    const aNum = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? aNum : -aNum;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const formatPnl = (pnl: number | null | undefined, pct: number | null | undefined) => {
    if (pnl == null) return '-';
    const sign = pnl >= 0 ? '+' : '';
    return (
      <Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: 'JetBrains Mono, monospace', color: pnl >= 0 ? 'success.main' : 'error.main' }}
        >
          {sign}¥{pnl.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </Typography>
        {pct != null && (
          <Typography variant="caption" sx={{ color: pct >= 0 ? 'success.main' : 'error.main' }}>
            ({sign}{pct.toFixed(2)}%)
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, borderRadius: '12px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('portfolio.positions')} ({filtered.length})
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
        >
          <ToggleButton value="all" sx={{ textTransform: 'none', px: 1.5 }}>
            {t('portfolio.all')}
          </ToggleButton>
          <ToggleButton value="stock" sx={{ textTransform: 'none', px: 1.5 }}>
            {t('portfolio.stock_type')}
          </ToggleButton>
          <ToggleButton value="fund" sx={{ textTransform: 'none', px: 1.5 }}>
            {t('portfolio.fund_type')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {sorted.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">{t('portfolio.no_positions')}</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('portfolio.asset')}</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'total_shares'}
                    direction={sortField === 'total_shares' ? sortDir : 'desc'}
                    onClick={() => handleSort('total_shares')}
                  >
                    {t('portfolio.shares')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">{t('portfolio.avg_cost')}</TableCell>
                <TableCell align="right">{t('portfolio.current_price')}</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'current_value'}
                    direction={sortField === 'current_value' ? sortDir : 'desc'}
                    onClick={() => handleSort('current_value')}
                  >
                    {t('portfolio.value')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'unrealized_pnl_pct'}
                    direction={sortField === 'unrealized_pnl_pct' ? sortDir : 'desc'}
                    onClick={() => handleSort('unrealized_pnl_pct')}
                  >
                    {t('portfolio.pnl')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((pos) => (
                <TableRow key={pos.id} hover>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          label={pos.asset_type === 'stock' ? t('portfolio.stock_type') : t('portfolio.fund_type')}
                          size="small"
                          color={pos.asset_type === 'stock' ? 'primary' : 'secondary'}
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {pos.asset_name || pos.asset_code}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {pos.asset_code}
                        {pos.sector && ` · ${pos.sector}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {pos.total_shares.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ¥{pos.average_cost.toFixed(4)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {pos.current_price != null ? `¥${pos.current_price.toFixed(4)}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {pos.current_value != null
                      ? `¥${pos.current_value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {formatPnl(pos.unrealized_pnl, pos.unrealized_pnl_pct)}
                  </TableCell>
                  <TableCell align="center">
                    {onRecalculate && (
                      <Tooltip title={t('portfolio.recalculate')}>
                        <IconButton size="small" onClick={() => onRecalculate(pos.id)}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={t('common.delete')}>
                      <IconButton size="small" color="error" onClick={() => onDelete(pos.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
