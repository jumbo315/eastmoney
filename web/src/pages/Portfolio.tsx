import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Snackbar,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DataMigrationIcon from '@mui/icons-material/CloudSync';
import PieChartIcon from '@mui/icons-material/PieChart';
import GridViewIcon from '@mui/icons-material/GridView';
import {
  fetchPortfolios,
  fetchDefaultPortfolio,
  fetchPortfolioSummaryNew,
  fetchTransactions,
  fetchPortfolioAlerts,
  fetchPortfolioDiagnosis,
  fetchRebalanceSuggestions,
  fetchDIPPlans,
  createPortfolio,
  deletePortfolio,
  setDefaultPortfolio,
  createTransaction,
  deleteTransaction,
  deleteUnifiedPosition,
  recalculatePosition,
  markAlertRead,
  dismissAlertApi,
  createDIPPlan,
  deleteDIPPlan,
  updateDIPPlan,
  executeDIPPlan,
  migrateOldPositions,
  // New institutional-grade APIs
  fetchStressTestScenarios,
  runStressTest,
  fetchPortfolioCorrelation,
  fetchPortfolioSignals,
  fetchSignalDetail,
  fetchRiskSummary,
  fetchPortfolioSparkline,
} from '../api';
import type {
  Portfolio,
  UnifiedPosition,
  Transaction,
  PortfolioAlert,
  PortfolioDiagnosis,
  RebalanceSuggestion,
  DIPPlan,
  PortfolioCreateData,
  StressTestScenario,
  StressTestSlider,
  StressTestResult,
  CorrelationResult,
  PortfolioSignal,
  PortfolioSignalDetail,
  RiskSummary,
  SparklineData,
} from '../api';
import {
  PortfolioSwitcher,
  AllocationPieChart,
  TransactionForm,
  TransactionHistory,
  AssetSearchDialog,
  PortfolioDiagnosisCard,
  RebalanceSuggestions,
  AlertBanner,
  DIPPlanCard,
  DIPPlanForm,
  // New institutional-grade components
  PortfolioHeader,
  StressTestSandbox,
  CorrelationHeatmap,
  SmartPositionTable,
} from '../components/portfolio';
import type { TransactionFormData, DIPPlanFormData } from '../components/portfolio';

type TabValue = 'overview' | 'transactions' | 'dip';
type RightPanelTab = 'correlation' | 'allocation';

export default function PortfolioPage() {
  const { t } = useTranslation();
  const theme = useTheme();

  // State - Core data
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<UnifiedPosition[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<PortfolioAlert[]>([]);
  const [diagnosis, setDiagnosis] = useState<PortfolioDiagnosis | null>(null);
  const [rebalanceSuggestions, setRebalanceSuggestions] = useState<RebalanceSuggestion[]>([]);
  const [currentAllocation, setCurrentAllocation] = useState<Record<string, number>>({});
  const [dipPlans, setDIPPlans] = useState<DIPPlan[]>([]);

  // State - New institutional-grade data
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [sparklineData, setSparklineData] = useState<SparklineData | null>(null);
  const [stressTestScenarios, setStressTestScenarios] = useState<StressTestScenario[]>([]);
  const [stressTestSliders, setStressTestSliders] = useState<StressTestSlider[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationResult | null>(null);
  const [signals, setSignals] = useState<PortfolioSignal[]>([]);

  // Summary state
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalPnl: 0,
    totalPnlPct: 0,
    positionsCount: 0,
    allocationByType: {} as Record<string, number>,
    allocationBySector: {} as Record<string, number>,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabValue>('overview');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('correlation');
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [correlationLoading, setCorrelationLoading] = useState(false);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog state
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [dipFormOpen, setDIPFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{
    code: string;
    name: string;
    type: 'stock' | 'fund';
    sector?: string;
  } | null>(null);

  // Load portfolios on mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  // Load portfolio data when current portfolio changes
  useEffect(() => {
    if (currentPortfolio) {
      loadPortfolioData(currentPortfolio.id);
      loadInstitutionalData(currentPortfolio.id);
    }
  }, [currentPortfolio?.id]);

  const loadPortfolios = async () => {
    try {
      const [portfoliosRes, defaultRes] = await Promise.all([
        fetchPortfolios(),
        fetchDefaultPortfolio(),
      ]);
      setPortfolios(portfoliosRes.portfolios);
      setCurrentPortfolio(defaultRes);
    } catch (err: any) {
      setError(err.message || t('portfolio.error_load'));
    }
  };

  const loadPortfolioData = async (portfolioId: number) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        fetchPortfolioSummaryNew(portfolioId),
        fetchPortfolioAlerts(portfolioId, true),
      ]);

      setPositions(summaryRes.positions || []);
      setSummary({
        totalValue: summaryRes.total_value,
        totalCost: summaryRes.total_cost,
        totalPnl: summaryRes.total_pnl,
        totalPnlPct: summaryRes.total_pnl_pct,
        positionsCount: summaryRes.positions_count,
        allocationByType: summaryRes.allocation?.by_type || {},
        allocationBySector: summaryRes.allocation?.by_sector || {},
      });
      setAlerts(alertsRes.alerts);
    } catch (err: any) {
      setError(err.message || t('portfolio.error_load'));
    } finally {
      setLoading(false);
    }
  };

  // Load institutional-grade data
  const loadInstitutionalData = async (portfolioId: number) => {
    // Load risk summary and sparkline
    setRiskLoading(true);
    try {
      const [riskRes, sparklineRes, scenariosRes] = await Promise.all([
        fetchRiskSummary(portfolioId),
        fetchPortfolioSparkline(portfolioId, 7),
        fetchStressTestScenarios(portfolioId),
      ]);
      setRiskSummary(riskRes);
      setSparklineData(sparklineRes);
      setStressTestScenarios(scenariosRes.scenarios);
      setStressTestSliders(scenariosRes.sliders);
    } catch (err) {
      console.error('Failed to load risk data:', err);
    } finally {
      setRiskLoading(false);
    }

    // Load correlation data
    loadCorrelation(portfolioId);

    // Load signals
    loadSignals(portfolioId);
  };

  const loadCorrelation = async (portfolioId: number) => {
    setCorrelationLoading(true);
    try {
      const res = await fetchPortfolioCorrelation(portfolioId, 90);
      setCorrelationData(res);
    } catch (err) {
      console.error('Failed to load correlation:', err);
    } finally {
      setCorrelationLoading(false);
    }
  };

  const loadSignals = async (portfolioId: number) => {
    setSignalsLoading(true);
    try {
      const res = await fetchPortfolioSignals(portfolioId);
      setSignals(res.signals);
    } catch (err) {
      console.error('Failed to load signals:', err);
    } finally {
      setSignalsLoading(false);
    }
  };

  const loadTransactions = useCallback(async () => {
    if (!currentPortfolio) return;
    try {
      const res = await fetchTransactions(currentPortfolio.id, undefined, 100, 0);
      setTransactions(res.transactions);
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
    }
  }, [currentPortfolio?.id]);

  const loadDIPPlans = useCallback(async () => {
    if (!currentPortfolio) return;
    try {
      const res = await fetchDIPPlans(currentPortfolio.id);
      setDIPPlans(res.dip_plans);
    } catch (err: any) {
      console.error('Failed to load DIP plans:', err);
    }
  }, [currentPortfolio?.id]);

  const loadDiagnosis = useCallback(async () => {
    if (!currentPortfolio) return;
    setDiagnosisLoading(true);
    try {
      const [diagRes, rebalanceRes] = await Promise.all([
        fetchPortfolioDiagnosis(currentPortfolio.id),
        fetchRebalanceSuggestions(currentPortfolio.id),
      ]);
      setDiagnosis(diagRes);
      setRebalanceSuggestions(rebalanceRes.suggestions);
      setCurrentAllocation(rebalanceRes.current_allocation);
    } catch (err: any) {
      console.error('Failed to load diagnosis:', err);
    } finally {
      setDiagnosisLoading(false);
    }
  }, [currentPortfolio?.id]);

  // Load tab-specific data
  useEffect(() => {
    if (tab === 'transactions') {
      loadTransactions();
    } else if (tab === 'dip') {
      loadDIPPlans();
    }
  }, [tab, loadTransactions, loadDIPPlans]);

  // Handlers
  const handleSwitchPortfolio = (portfolioId: number) => {
    const portfolio = portfolios.find((p) => p.id === portfolioId);
    if (portfolio) {
      setCurrentPortfolio(portfolio);
      setDiagnosis(null);
      setRebalanceSuggestions([]);
      setRiskSummary(null);
      setCorrelationData(null);
      setSignals([]);
    }
  };

  const handleCreatePortfolio = async (data: PortfolioCreateData) => {
    await createPortfolio(data);
    await loadPortfolios();
    showSnackbar(t('common.created'), 'success');
  };

  const handleDeletePortfolio = async (portfolioId: number) => {
    await deletePortfolio(portfolioId);
    await loadPortfolios();
    showSnackbar(t('common.deleted'), 'success');
  };

  const handleSetDefault = async (portfolioId: number) => {
    await setDefaultPortfolio(portfolioId);
    await loadPortfolios();
    showSnackbar(t('common.saved'), 'success');
  };

  const handleAssetSelect = (asset: { code: string; name: string; type: 'stock' | 'fund'; sector?: string }) => {
    setSelectedAsset(asset);
    setSearchDialogOpen(false);
    setTransactionFormOpen(true);
  };

  const handleCreateTransaction = async (data: TransactionFormData) => {
    if (!currentPortfolio) return;
    await createTransaction(currentPortfolio.id, data);
    await loadPortfolioData(currentPortfolio.id);
    await loadInstitutionalData(currentPortfolio.id);
    if (tab === 'transactions') {
      await loadTransactions();
    }
    showSnackbar(t('portfolio.add_transaction') + ' - ' + t('common.success'), 'success');
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!currentPortfolio) return;
    if (!window.confirm(t('portfolio.confirm_delete'))) return;
    await deleteTransaction(currentPortfolio.id, transactionId);
    await loadTransactions();
    showSnackbar(t('common.deleted'), 'success');
  };

  const handleDeletePosition = async (positionId: number) => {
    if (!currentPortfolio) return;
    if (!window.confirm(t('portfolio.confirm_delete'))) return;
    await deleteUnifiedPosition(currentPortfolio.id, positionId);
    await loadPortfolioData(currentPortfolio.id);
    await loadInstitutionalData(currentPortfolio.id);
    showSnackbar(t('common.deleted'), 'success');
  };

  const handleRecalculatePosition = async (positionId: number) => {
    if (!currentPortfolio) return;
    await recalculatePosition(currentPortfolio.id, positionId);
    await loadPortfolioData(currentPortfolio.id);
    showSnackbar(t('portfolio.recalculate') + ' - ' + t('common.success'), 'success');
  };

  const handleMarkAlertRead = async (alertId: number) => {
    await markAlertRead(alertId);
    if (currentPortfolio) {
      const alertsRes = await fetchPortfolioAlerts(currentPortfolio.id, true);
      setAlerts(alertsRes.alerts);
    }
  };

  const handleDismissAlert = async (alertId: number) => {
    await dismissAlertApi(alertId);
    if (currentPortfolio) {
      const alertsRes = await fetchPortfolioAlerts(currentPortfolio.id, true);
      setAlerts(alertsRes.alerts);
    }
  };

  const handleCreateDIPPlan = async (data: DIPPlanFormData) => {
    if (!currentPortfolio) return;
    await createDIPPlan(currentPortfolio.id, data);
    await loadDIPPlans();
    showSnackbar(t('portfolio.create_dip_plan') + ' - ' + t('common.success'), 'success');
  };

  const handleDeleteDIPPlan = async (planId: number) => {
    if (!currentPortfolio) return;
    await deleteDIPPlan(currentPortfolio.id, planId);
    await loadDIPPlans();
    showSnackbar(t('common.deleted'), 'success');
  };

  const handleToggleDIPActive = async (planId: number, isActive: boolean) => {
    if (!currentPortfolio) return;
    await updateDIPPlan(currentPortfolio.id, planId, { is_active: isActive });
    await loadDIPPlans();
  };

  const handleExecuteDIP = async (planId: number) => {
    if (!currentPortfolio) return;
    try {
      const result = await executeDIPPlan(currentPortfolio.id, planId);
      await loadDIPPlans();
      await loadPortfolioData(currentPortfolio.id);
      showSnackbar(
        `${t('portfolio.execute_now')} - ${result.shares.toFixed(2)} ${t('portfolio.shares_unit')} @ ¥${result.price.toFixed(4)}`,
        'success'
      );
    } catch (err: any) {
      showSnackbar(err.message || t('common.error'), 'error');
    }
  };

  const handleMigrateData = async () => {
    if (!currentPortfolio) return;
    try {
      const result = await migrateOldPositions(currentPortfolio.id);
      await loadPortfolioData(currentPortfolio.id);
      showSnackbar(t('portfolio.migrate_success', { count: result.migrated_count }), 'success');
    } catch (err: any) {
      showSnackbar(err.message || t('common.error'), 'error');
    }
  };

  const handleRunStressTest = async (params: { scenario_type?: string; scenario?: Record<string, number> }): Promise<StressTestResult> => {
    if (!currentPortfolio) throw new Error('No portfolio selected');
    return await runStressTest(currentPortfolio.id, params);
  };

  const handleLoadSignalDetail = async (assetCode: string): Promise<PortfolioSignalDetail> => {
    if (!currentPortfolio) throw new Error('No portfolio selected');
    return await fetchSignalDetail(currentPortfolio.id, assetCode);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = () => {
    if (currentPortfolio) {
      loadPortfolioData(currentPortfolio.id);
      loadInstitutionalData(currentPortfolio.id);
      setDiagnosis(null);
    }
  };

  if (loading && !currentPortfolio) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header with Portfolio Switcher */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <PortfolioSwitcher
          portfolios={portfolios}
          currentPortfolio={currentPortfolio}
          onSwitch={handleSwitchPortfolio}
          onCreate={handleCreatePortfolio}
          onDelete={handleDeletePortfolio}
          onSetDefault={handleSetDefault}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setSearchDialogOpen(true)}
            sx={{
              bgcolor: '#6366f1',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            {t('portfolio.add_transaction')}
          </Button>
          <Tooltip title={t('portfolio.migrate_desc')}>
            <IconButton onClick={handleMigrateData}>
              <DataMigrationIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <AlertBanner
            alerts={alerts}
            onDismiss={handleDismissAlert}
            onMarkRead={handleMarkAlertRead}
          />
        </Box>
      )}

      {/* NEW: Enhanced Portfolio Header with Risk Metrics */}
      <PortfolioHeader
        totalValue={summary.totalValue}
        totalPnl={summary.totalPnl}
        totalPnlPct={summary.totalPnlPct}
        sparklineData={sparklineData ? {
          values: sparklineData.values,
          dates: sparklineData.dates,
          trend: sparklineData.trend,
        } : undefined}
        beta={riskSummary?.beta}
        betaStatus={riskSummary?.beta_status}
        sharpeRatio={riskSummary?.sharpe_ratio}
        sharpeStatus={riskSummary?.sharpe_status}
        healthScore={riskSummary?.health_score ?? 50}
        healthGrade={riskSummary?.health_grade ?? 'N/A'}
        loading={riskLoading}
      />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
        }}
      >
        <Tab value="overview" label={t('portfolio.commandCenter', '投资指挥舱')} />
        <Tab value="transactions" label={t('portfolio.transaction_history')} icon={<ReceiptIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab value="dip" label={t('portfolio.dip_plans')} />
      </Tabs>

      {/* Tab Content */}
      {tab === 'overview' && (
        <>
          {/* T-Layout: Left Panel (2/3) + Right Panel (1/3) */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Left Panel: Stress Test Sandbox */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <StressTestSandbox
                portfolioId={currentPortfolio?.id || 0}
                scenarios={stressTestScenarios}
                sliders={stressTestSliders}
                onRunStressTest={handleRunStressTest}
              />
            </Grid>

            {/* Right Panel: Correlation Heatmap / Allocation Chart */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  minHeight: 500,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                {/* Right Panel Tabs */}
                <Tabs
                  value={rightPanelTab}
                  onChange={(_, v) => setRightPanelTab(v)}
                  variant="fullWidth"
                  sx={{
                    mb: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      minHeight: 36,
                    },
                  }}
                >
                  <Tab
                    value="correlation"
                    label={t('portfolio.correlationHeatmap', '相关性')}
                    icon={<GridViewIcon sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                  />
                  <Tab
                    value="allocation"
                    label={t('portfolio.allocation', '配置')}
                    icon={<PieChartIcon sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                  />
                </Tabs>

                {rightPanelTab === 'correlation' && (
                  <CorrelationHeatmap
                    data={correlationData?.matrix || []}
                    labels={correlationData?.labels || []}
                    codes={correlationData?.codes || []}
                    size={correlationData?.size || 0}
                    diversificationScore={correlationData?.diversification_score || 0}
                    diversificationStatus={correlationData?.diversification_status || 'unknown'}
                    loading={correlationLoading}
                    height={380}
                  />
                )}

                {rightPanelTab === 'allocation' && (
                  <Box sx={{ mt: 2 }}>
                    <AllocationPieChart
                      allocationByType={summary.allocationByType}
                      allocationBySector={summary.allocationBySector}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom: Smart Position Table with AI Signals */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              {t('portfolio.smartPositions', '智能持仓')}
            </Typography>
            <SmartPositionTable
              positions={positions}
              signals={signals}
              onDelete={handleDeletePosition}
              onRecalculate={handleRecalculatePosition}
              onLoadSignalDetail={handleLoadSignalDetail}
              loading={loading || signalsLoading}
            />
          </Box>

          {/* AI Diagnosis and Rebalancing (Optional - can be toggled) */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PortfolioDiagnosisCard
                diagnosis={diagnosis}
                loading={diagnosisLoading}
                onRefresh={loadDiagnosis}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {(rebalanceSuggestions.length > 0 || diagnosis) && (
                <RebalanceSuggestions
                  suggestions={rebalanceSuggestions}
                  currentAllocation={currentAllocation}
                  loading={diagnosisLoading}
                  onRefresh={loadDiagnosis}
                />
              )}
            </Grid>
          </Grid>
        </>
      )}

      {tab === 'transactions' && (
        <TransactionHistory
          transactions={transactions}
          onDelete={handleDeleteTransaction}
          loading={loading}
        />
      )}

      {tab === 'dip' && (
        <DIPPlanCard
          plans={dipPlans}
          onExecute={handleExecuteDIP}
          onDelete={handleDeleteDIPPlan}
          onToggleActive={handleToggleDIPActive}
          onCreate={() => setDIPFormOpen(true)}
          loading={loading}
        />
      )}

      {/* Dialogs */}
      <AssetSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSelect={handleAssetSelect}
      />

      <TransactionForm
        open={transactionFormOpen}
        onClose={() => {
          setTransactionFormOpen(false);
          setSelectedAsset(null);
        }}
        onSubmit={handleCreateTransaction}
        assetCode={selectedAsset?.code}
        assetName={selectedAsset?.name}
        assetType={selectedAsset?.type}
      />

      <DIPPlanForm
        open={dipFormOpen}
        onClose={() => setDIPFormOpen(false)}
        onSubmit={handleCreateDIPPlan}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
