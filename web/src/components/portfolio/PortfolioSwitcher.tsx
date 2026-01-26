import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Portfolio, PortfolioCreateData } from '../../api';

interface PortfolioSwitcherProps {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  onSwitch: (portfolioId: number) => void;
  onCreate: (data: PortfolioCreateData) => Promise<void>;
  onDelete: (portfolioId: number) => Promise<void>;
  onSetDefault: (portfolioId: number) => Promise<void>;
}

export default function PortfolioSwitcher({
  portfolios,
  currentPortfolio,
  onSwitch,
  onCreate,
  onDelete,
  onSetDefault,
}: PortfolioSwitcherProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBenchmark, setNewBenchmark] = useState('000300.SH');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate({
      name: newName.trim(),
      description: newDesc.trim(),
      benchmark_code: newBenchmark.trim() || '000300.SH',
    });
    setCreateDialogOpen(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'text.primary',
          px: 1.5,
        }}
      >
        <FolderIcon sx={{ mr: 1, color: '#6366f1' }} />
        {currentPortfolio?.name || t('portfolio.title')}
        {currentPortfolio?.is_default && (
          <Chip
            label={t('portfolio.default')}
            size="small"
            sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: '#6366f1', color: 'white' }}
          />
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 280, borderRadius: '12px' } }}
      >
        {portfolios.map((p) => (
          <MenuItem
            key={p.id}
            selected={p.id === currentPortfolio?.id}
            onClick={() => {
              onSwitch(p.id);
              setAnchorEl(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <FolderIcon fontSize="small" sx={{ color: p.id === currentPortfolio?.id ? '#6366f1' : 'inherit' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {p.name}
                  {p.is_default && <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />}
                </Box>
              }
              secondary={p.description}
            />
            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
              {!p.is_default && (
                <Tooltip title={t('portfolio.set_default')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetDefault(p.id);
                    }}
                  >
                    <StarBorderIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {!p.is_default && (
                <Tooltip title={t('common.delete')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(t('portfolio.confirm_delete_portfolio'))) {
                        onDelete(p.id);
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </MenuItem>
        ))}

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setCreateDialogOpen(true);
          }}
          sx={{ color: '#6366f1', fontWeight: 600 }}
        >
          <ListItemIcon>
            <AddIcon sx={{ color: '#6366f1' }} />
          </ListItemIcon>
          <ListItemText primary={t('portfolio.create_portfolio')} />
        </MenuItem>
      </Menu>

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('portfolio.create_portfolio')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label={t('portfolio.portfolio_name')}
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            size="small"
          />
          <TextField
            label={t('portfolio.portfolio_desc')}
            fullWidth
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            size="small"
          />
          <TextField
            label={t('portfolio.benchmark')}
            fullWidth
            value={newBenchmark}
            onChange={(e) => setNewBenchmark(e.target.value)}
            size="small"
            helperText={t('portfolio.benchmark_help')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newName.trim()}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
