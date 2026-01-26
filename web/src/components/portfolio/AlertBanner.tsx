import { useTranslation } from 'react-i18next';
import { Box, Alert, AlertTitle, IconButton, Chip, Collapse, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import type { PortfolioAlert } from '../../api';

interface AlertBannerProps {
  alerts: PortfolioAlert[];
  onDismiss: (alertId: number) => void;
  onMarkRead: (alertId: number) => void;
}

const SEVERITY_MAP: Record<string, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
};

export default function AlertBanner({ alerts, onDismiss, onMarkRead }: AlertBannerProps) {
  const { t } = useTranslation();

  const visibleAlerts = alerts.filter((a) => !a.is_dismissed);

  if (visibleAlerts.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {visibleAlerts.slice(0, 3).map((alert) => (
        <Alert
          key={alert.id}
          severity={SEVERITY_MAP[alert.severity] || 'info'}
          icon={<NotificationsActiveIcon fontSize="small" />}
          action={
            <IconButton
              size="small"
              onClick={() => onDismiss(alert.id)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            borderRadius: '10px',
            alignItems: 'center',
            cursor: !alert.is_read ? 'pointer' : 'default',
            fontWeight: !alert.is_read ? 600 : 400,
          }}
          onClick={() => {
            if (!alert.is_read) onMarkRead(alert.id);
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, mb: 0, fontSize: '0.85rem' }}>
            {alert.title}
            {!alert.is_read && (
              <Chip
                label={t('portfolio.new_alert')}
                size="small"
                color="error"
                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
              />
            )}
          </AlertTitle>
          <Typography variant="body2">{alert.message}</Typography>
        </Alert>
      ))}
      {visibleAlerts.length > 3 && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t('portfolio.more_alerts', { count: visibleAlerts.length - 3 })}
        </Typography>
      )}
    </Box>
  );
}
