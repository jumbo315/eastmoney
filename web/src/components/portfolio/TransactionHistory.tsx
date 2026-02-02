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
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Transaction } from '../../api';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDelete: (transactionId: number) => void;
  loading?: boolean;
}

const TX_TYPE_COLORS: Record<string, 'success' | 'error' | 'info' | 'warning' | 'default'> = {
  buy: 'success',
  sell: 'error',
  dividend: 'info',
  split: 'warning',
  transfer_in: 'success',
  transfer_out: 'error',
};

export default function TransactionHistory({ transactions, onDelete, loading }: TransactionHistoryProps) {
  const { t } = useTranslation();

  const txTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      buy: t('portfolio.tx_buy'),
      sell: t('portfolio.tx_sell'),
      dividend: t('portfolio.tx_dividend'),
      split: t('portfolio.tx_split'),
      transfer_in: t('portfolio.tx_transfer_in'),
      transfer_out: t('portfolio.tx_transfer_out'),
    };
    return labels[type] || type;
  };

  return (
    <Paper sx={{ p: 2, borderRadius: '12px' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {t('portfolio.transaction_history')} ({transactions.length})
      </Typography>

      {transactions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">{t('portfolio.no_transactions')}</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('portfolio.date')}</TableCell>
                <TableCell>{t('portfolio.asset')}</TableCell>
                <TableCell>{t('portfolio.type')}</TableCell>
                <TableCell align="right">{t('portfolio.shares')}</TableCell>
                <TableCell align="right">{t('portfolio.price')}</TableCell>
                <TableCell align="right">{t('portfolio.total_amount')}</TableCell>
                <TableCell align="right">{t('portfolio.fees')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                    {tx.transaction_date}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {tx.asset_name || tx.asset_code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tx.asset_code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={txTypeLabel(tx.transaction_type)}
                      size="small"
                      color={TX_TYPE_COLORS[tx.transaction_type] || 'default'}
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {tx.shares.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ¥{tx.price.toFixed(4)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ¥{tx.total_amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {tx.fees > 0 ? `¥${tx.fees.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={t('common.delete')}>
                      <IconButton size="small" color="error" onClick={() => onDelete(tx.id)}>
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
