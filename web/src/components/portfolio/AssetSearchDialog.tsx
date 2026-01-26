import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchMarketFunds, searchMarketStocks } from '../../api';

interface AssetSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: { code: string; name: string; type: 'stock' | 'fund'; sector?: string }) => void;
}

export default function AssetSearchDialog({ open, onClose, onSelect }: AssetSearchDialogProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'stock' | 'fund'>('stock');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = async (query: string) => {
    if (query.length < 2) return;
    setSearching(true);
    try {
      if (tab === 'fund') {
        const results = await searchMarketFunds(query);
        setSearchResults(results);
      } else {
        const results = await searchMarketStocks(query);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleTabChange = (_: any, newValue: 'stock' | 'fund') => {
    setTab(newValue);
    setSearchResults([]);
    setSearchInput('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {t('portfolio.search_asset')}
        </Typography>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          <Tab value="stock" label={t('portfolio.stock_type')} />
          <Tab value="fund" label={t('portfolio.fund_type')} />
        </Tabs>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Autocomplete
          fullWidth
          options={searchResults}
          getOptionLabel={(option) =>
            tab === 'fund'
              ? `${option.code} - ${option.name}`
              : `${option.code} - ${option.name}${option.industry ? ` (${option.industry})` : ''}`
          }
          loading={searching}
          inputValue={searchInput}
          onInputChange={(_, value) => {
            setSearchInput(value);
            if (value.length >= 2) {
              handleSearch(value);
            }
          }}
          onChange={(_, value) => {
            if (value) {
              onSelect({
                code: value.code,
                name: value.name,
                type: tab,
                sector: value.industry || value.sector,
              });
              onClose();
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={tab === 'stock' ? t('portfolio.search_stock') : t('portfolio.search_fund')}
              placeholder={t('portfolio.search_hint')}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searching && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.code}>
              <Box sx={{ py: 0.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.name}
                  </Typography>
                  {(option.industry || option.type) && (
                    <Chip
                      label={option.industry || option.type}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {option.code}
                </Typography>
              </Box>
            </li>
          )}
          noOptionsText={searchInput.length < 2 ? t('portfolio.search_hint') : t('portfolio.no_results')}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          {t('portfolio.search_tip')}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
