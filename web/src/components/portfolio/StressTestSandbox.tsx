import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import debounce from 'lodash/debounce';
import ScenarioPresets from './ScenarioPresets';
import MacroFactorSlider from './MacroFactorSlider';
import StressTestResults from './StressTestResults';

// Zustand store for stress test state
interface SandboxState {
  scenario: {
    interest_rate_change_bp: number;
    fx_change_pct: number;
    index_change_pct: number;
    oil_change_pct: number;
  };
  selectedPreset: string | null;
  isCustomMode: boolean;
  setScenario: (updates: Partial<SandboxState['scenario']>) => void;
  setSelectedPreset: (preset: string | null) => void;
  setCustomMode: (isCustom: boolean) => void;
  reset: () => void;
}

const useSandboxStore = create<SandboxState>((set) => ({
  scenario: {
    interest_rate_change_bp: 0,
    fx_change_pct: 0,
    index_change_pct: 0,
    oil_change_pct: 0,
  },
  selectedPreset: null,
  isCustomMode: false,
  setScenario: (updates) =>
    set((state) => ({
      scenario: { ...state.scenario, ...updates },
    })),
  setSelectedPreset: (preset) => set({ selectedPreset: preset, isCustomMode: false }),
  setCustomMode: (isCustom) =>
    set({ isCustomMode: isCustom, selectedPreset: isCustom ? null : null }),
  reset: () =>
    set({
      scenario: {
        interest_rate_change_bp: 0,
        fx_change_pct: 0,
        index_change_pct: 0,
        oil_change_pct: 0,
      },
      selectedPreset: null,
      isCustomMode: false,
    }),
}));

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface SliderConfig {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
  description: string;
}

interface StressTestResult {
  projected_pnl: number;
  projected_pnl_pct: number;
  var_95: number;
  var_95_pct: number;
  top_losers: Array<{
    code: string;
    name: string;
    projected_change: number;
    impact_pct: number;
  }>;
  top_gainers: Array<{
    code: string;
    name: string;
    projected_change: number;
    impact_pct: number;
  }>;
  risk_level: string;
}

interface StressTestSandboxProps {
  portfolioId: number;
  scenarios: Scenario[];
  sliders: SliderConfig[];
  onRunStressTest: (params: {
    scenario_type?: string;
    scenario?: Record<string, number>;
  }) => Promise<StressTestResult>;
  initialResult?: StressTestResult | null;
}

const StressTestSandbox: React.FC<StressTestSandboxProps> = ({
  portfolioId,
  scenarios,
  sliders,
  onRunStressTest,
  initialResult,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    scenario,
    selectedPreset,
    isCustomMode,
    setScenario,
    setSelectedPreset,
    setCustomMode,
  } = useSandboxStore();

  const [result, setResult] = useState<StressTestResult | null>(initialResult || null);
  const [loading, setLoading] = useState(false);

  // Debounced stress test execution
  const runStressTestDebounced = useCallback(
    debounce(async (params: { scenario_type?: string; scenario?: Record<string, number> }) => {
      setLoading(true);
      try {
        const response = await onRunStressTest(params);
        setResult(response);
      } catch (error) {
        console.error('Stress test failed:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [onRunStressTest]
  );

  // Run stress test when preset changes
  useEffect(() => {
    if (selectedPreset) {
      runStressTestDebounced({ scenario_type: selectedPreset });
    }
  }, [selectedPreset, runStressTestDebounced]);

  // Run stress test when custom scenario changes
  useEffect(() => {
    if (isCustomMode) {
      const hasChanges = Object.values(scenario).some((v) => v !== 0);
      if (hasChanges) {
        runStressTestDebounced({ scenario });
      }
    }
  }, [scenario, isCustomMode, runStressTestDebounced]);

  const handlePresetSelect = (presetId: string) => {
    if (selectedPreset === presetId) {
      setSelectedPreset(null);
      setResult(null);
    } else {
      setSelectedPreset(presetId);
    }
  };

  const handleSliderChange = (id: string, value: number) => {
    setScenario({ [id]: value } as Partial<SandboxState['scenario']>);
  };

  const handleCustomModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMode(event.target.checked);
    if (!event.target.checked) {
      setResult(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {t('portfolio.stressTestSandbox', '压力测试沙箱')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('portfolio.stressTestDescription', '模拟宏观因素变化对您组合的影响')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Preset Scenarios */}
        <Box>
          <ScenarioPresets
            scenarios={scenarios}
            selectedScenario={selectedPreset}
            onSelect={handlePresetSelect}
            disabled={isCustomMode || loading}
          />
        </Box>

        <Divider>
          <FormControlLabel
            control={
              <Switch
                checked={isCustomMode}
                onChange={handleCustomModeToggle}
                size="small"
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                {t('portfolio.customScenario', '自定义情景')}
              </Typography>
            }
          />
        </Divider>

        {/* Custom Factor Sliders */}
        {isCustomMode && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
            }}
          >
            {sliders.map((slider) => (
              <MacroFactorSlider
                key={slider.id}
                id={slider.id}
                name={slider.name}
                value={scenario[slider.id as keyof typeof scenario] || 0}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                unit={slider.unit}
                description={slider.description}
                onChange={handleSliderChange}
                disabled={loading}
              />
            ))}
          </Box>
        )}

        <Divider />

        {/* Results */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('portfolio.simulationResults', '模拟结果')}
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : result ? (
            <StressTestResults
              projectedPnl={result.projected_pnl}
              projectedPnlPct={result.projected_pnl_pct}
              var95={result.var_95}
              var95Pct={result.var_95_pct}
              topLosers={result.top_losers}
              topGainers={result.top_gainers}
              riskLevel={result.risk_level}
            />
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                {t('portfolio.selectScenario', '请选择一个预设情景或自定义参数')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default StressTestSandbox;
