import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  InputAdornment,
} from '@mui/material';

export interface DIPPlanFormData {
  asset_type: string;
  asset_code: string;
  asset_name?: string;
  amount_per_period: number;
  frequency: string;
  execution_day?: number;
  start_date: string;
  end_date?: string;
  notes?: string;
}

interface DIPPlanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DIPPlanFormData) => Promise<void>;
  assetCode?: string;
  assetName?: string;
  assetType?: string;
}

export default function DIPPlanForm({
  open,
  onClose,
  onSubmit,
  assetCode = '',
  assetName = '',
  assetType = 'fund',
}: DIPPlanFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DIPPlanFormData>({
    asset_type: assetType,
    asset_code: assetCode,
    asset_name: assetName,
    amount_per_period: 1000,
    frequency: 'monthly',
    start_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  // Reset form when dialog opens or asset props change
  useEffect(() => {
    if (open) {
      setFormData({
        asset_type: assetType,
        asset_code: assetCode,
        asset_name: assetName,
        amount_per_period: 1000,
        frequency: 'monthly',
        start_date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setError('');
    }
  }, [open, assetCode, assetName, assetType]);

  const handleChange = (field: keyof DIPPlanFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'amount_per_period' || field === 'execution_day'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.asset_code) {
      setError(t('portfolio.error_asset_code'));
      return;
    }
    if (formData.amount_per_period <= 0) {
      setError(t('portfolio.error_amount'));
      return;
    }
    if (!formData.start_date) {
      setError(t('portfolio.error_date'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
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
        {t('portfolio.create_dip_plan')}
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

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('portfolio.amount_per_period')}
            type="number"
            value={formData.amount_per_period || ''}
            onChange={(e) => handleChange('amount_per_period', e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              },
            }}
          />
          <TextField
            select
            label={t('portfolio.frequency')}
            value={formData.frequency}
            onChange={(e) => handleChange('frequency', e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="daily">{t('portfolio.freq_daily')}</MenuItem>
            <MenuItem value="weekly">{t('portfolio.freq_weekly')}</MenuItem>
            <MenuItem value="biweekly">{t('portfolio.freq_biweekly')}</MenuItem>
            <MenuItem value="monthly">{t('portfolio.freq_monthly')}</MenuItem>
          </TextField>
        </Box>

        {(formData.frequency === 'weekly' || formData.frequency === 'monthly') && (
          <TextField
            label={formData.frequency === 'weekly' ? t('portfolio.execution_weekday') : t('portfolio.execution_day')}
            type="number"
            value={formData.execution_day || ''}
            onChange={(e) => handleChange('execution_day', e.target.value)}
            size="small"
            fullWidth
            helperText={
              formData.frequency === 'weekly'
                ? t('portfolio.weekday_help')
                : t('portfolio.day_help')
            }
            sx={{ mb: 2 }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('portfolio.start_date')}
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label={t('portfolio.end_date')}
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={t('portfolio.end_date_help')}
          />
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
          {loading ? t('common.saving') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
