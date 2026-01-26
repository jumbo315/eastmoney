import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';

export interface TransactionFormData {
  asset_type: string;
  asset_code: string;
  asset_name?: string;
  transaction_type: string;
  shares: number;
  price: number;
  total_amount?: number;
  fees?: number;
  transaction_date: string;
  notes?: string;
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  assetCode?: string;
  assetName?: string;
  assetType?: string;
}

const TRANSACTION_TYPES = [
  { value: 'buy', labelKey: 'portfolio.tx_buy' },
  { value: 'sell', labelKey: 'portfolio.tx_sell' },
  { value: 'dividend', labelKey: 'portfolio.tx_dividend' },
  { value: 'split', labelKey: 'portfolio.tx_split' },
  { value: 'transfer_in', labelKey: 'portfolio.tx_transfer_in' },
  { value: 'transfer_out', labelKey: 'portfolio.tx_transfer_out' },
];

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  assetCode = '',
  assetName = '',
  assetType = 'stock',
}: TransactionFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<TransactionFormData>({
    asset_type: assetType,
    asset_code: assetCode,
    asset_name: assetName,
    transaction_type: 'buy',
    shares: 0,
    price: 0,
    fees: 0,
    transaction_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  // Reset form when dialog opens or asset props change
  useEffect(() => {
    if (open) {
      setFormData({
        asset_type: assetType,
        asset_code: assetCode,
        asset_name: assetName,
        transaction_type: 'buy',
        shares: 0,
        price: 0,
        fees: 0,
        transaction_date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setError('');
    }
  }, [open, assetCode, assetName, assetType]);

  const handleChange = (field: keyof TransactionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: ['shares', 'price', 'fees'].includes(field as string) ? parseFloat(value) || 0 : value,
    }));
  };

  const totalAmount = formData.shares * formData.price;

  const handleSubmit = async () => {
    if (formData.shares <= 0) {
      setError(t('portfolio.error_shares'));
      return;
    }
    if (formData.price <= 0) {
      setError(t('portfolio.error_price'));
      return;
    }
    if (!formData.transaction_date) {
      setError(t('portfolio.error_date'));
      return;
    }
    if (!formData.asset_code) {
      setError(t('portfolio.error_asset_code'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit({
        ...formData,
        total_amount: totalAmount,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || t('portfolio.error_save'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>
        {t('portfolio.add_transaction')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
          <TextField
            select
            label={t('portfolio.asset_type')}
            value={formData.asset_type}
            onChange={(e) => handleChange('asset_type', e.target.value)}
            size="small"
            sx={{ width: 120 }}
          >
            <MenuItem value="stock">{t('portfolio.stock_type')}</MenuItem>
            <MenuItem value="fund">{t('portfolio.fund_type')}</MenuItem>
          </TextField>
          <TextField
            label={t('portfolio.asset_code')}
            value={formData.asset_code}
            onChange={(e) => handleChange('asset_code', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label={t('portfolio.asset_name')}
            value={formData.asset_name}
            onChange={(e) => handleChange('asset_name', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <TextField
          select
          fullWidth
          label={t('portfolio.transaction_type')}
          value={formData.transaction_type}
          onChange={(e) => handleChange('transaction_type', e.target.value)}
          size="small"
          sx={{ mb: 2 }}
        >
          {TRANSACTION_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {t(type.labelKey)}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('portfolio.shares')}
            type="number"
            value={formData.shares || ''}
            onChange={(e) => handleChange('shares', e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">{t('portfolio.shares_unit')}</InputAdornment>,
              },
            }}
          />
          <TextField
            label={t('portfolio.price')}
            type="number"
            value={formData.price || ''}
            onChange={(e) => handleChange('price', e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('portfolio.fees')}
            type="number"
            value={formData.fees || ''}
            onChange={(e) => handleChange('fees', e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              },
            }}
          />
          <TextField
            label={t('portfolio.transaction_date')}
            type="date"
            value={formData.transaction_date}
            onChange={(e) => handleChange('transaction_date', e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: '8px' }}>
          <Typography variant="body2" color="text.secondary">
            {t('portfolio.total_amount')}:
            <Typography component="span" sx={{ fontWeight: 700, ml: 1, fontFamily: 'JetBrains Mono, monospace' }}>
              ¥{totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </Typography>
          </Typography>
        </Box>

        <TextField
          label={t('portfolio.notes')}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          multiline
          rows={2}
          fullWidth
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          {loading ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
