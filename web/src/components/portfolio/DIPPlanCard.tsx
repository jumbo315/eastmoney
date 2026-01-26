import { useTranslation } from 'react-i18next';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Switch,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { DIPPlan } from '../../api';

interface DIPPlanCardProps {
  plans: DIPPlan[];
  onExecute: (planId: number) => void;
  onDelete: (planId: number) => void;
  onToggleActive: (planId: number, isActive: boolean) => void;
  onCreate: () => void;
  loading?: boolean;
}

const FREQ_LABELS: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
};

export default function DIPPlanCard({
  plans,
  onExecute,
  onDelete,
  onToggleActive,
  onCreate,
  loading,
}: DIPPlanCardProps) {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, borderRadius: '12px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon sx={{ color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('portfolio.dip_plans')}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onCreate}
          sx={{ textTransform: 'none', borderColor: '#6366f1', color: '#6366f1' }}
        >
          {t('portfolio.create_dip_plan')}
        </Button>
      </Box>

      {plans.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="text.secondary">{t('portfolio.no_dip_plans')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('portfolio.dip_desc')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {plans.map((plan) => {
            const avgCost = plan.total_shares > 0 ? plan.total_invested / plan.total_shares : 0;

            return (
              <Box
                key={plan.id}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: plan.is_active ? 'divider' : 'action.disabled',
                  bgcolor: plan.is_active ? 'background.paper' : 'action.disabledBackground',
                  opacity: plan.is_active ? 1 : 0.6,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={plan.asset_type === 'stock' ? t('portfolio.stock_type') : t('portfolio.fund_type')}
                      size="small"
                      color={plan.asset_type === 'stock' ? 'primary' : 'secondary'}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {plan.asset_name || plan.asset_code}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Switch
                      size="small"
                      checked={plan.is_active}
                      onChange={(e) => onToggleActive(plan.id, e.target.checked)}
                    />
                    <Tooltip title={t('portfolio.execute_now')}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onExecute(plan.id)}
                        disabled={!plan.is_active}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('portfolio.confirm_delete_dip'))) {
                            onDelete(plan.id);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    {FREQ_LABELS[plan.frequency] || plan.frequency}
                    ¥{plan.amount_per_period.toLocaleString('zh-CN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('portfolio.total_invested')}: ¥{plan.total_invested.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('portfolio.execution_count')}: {plan.execution_count}{t('portfolio.times')}
                  </Typography>
                  {avgCost > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {t('portfolio.avg_cost')}: ¥{avgCost.toFixed(4)}
                    </Typography>
                  )}
                </Box>

                {plan.next_execution_date && plan.is_active && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                    {t('portfolio.next_execution')}: {plan.next_execution_date}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
