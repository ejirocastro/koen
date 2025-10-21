/**
 * AlertSettings Component
 *
 * Allows users to configure alert thresholds.
 */
'use client';

import { useState } from 'react';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import toast from 'react-hot-toast';

export default function AlertSettings() {
  const { settings, updateAlerts } = useUserSettings();
  const alerts = settings.alerts;

  const [healthCritical, setHealthCritical] = useState(alerts.healthCritical.toString());
  const [healthWarning, setHealthWarning] = useState(alerts.healthWarning.toString());
  const [priceWarning, setPriceWarning] = useState(alerts.priceDeviationWarning.toString());
  const [priceCritical, setPriceCritical] = useState(alerts.priceDeviationCritical.toString());

  const handleHealthCriticalChange = (value: string) => {
    setHealthCritical(value);
    const num = parseFloat(value || '0');
    if (num >= 100 && num <= 150) {
      updateAlerts({ healthCritical: num });
    }
  };

  const handleHealthCriticalBlur = () => {
    const num = parseFloat(healthCritical || '0');
    if (num < 100) {
      setHealthCritical('100');
      updateAlerts({ healthCritical: 100 });
      toast.error('Minimum health critical threshold is 100%');
    } else if (num > 150) {
      setHealthCritical('150');
      updateAlerts({ healthCritical: 150 });
      toast.error('Maximum health critical threshold is 150%');
    } else if (num >= parseFloat(healthWarning)) {
      setHealthCritical((parseFloat(healthWarning) - 5).toString());
      updateAlerts({ healthCritical: parseFloat(healthWarning) - 5 });
      toast.error('Critical threshold must be below warning threshold');
    } else {
      toast.success('Health critical threshold updated', { duration: 2000 });
    }
  };

  const handleHealthWarningChange = (value: string) => {
    setHealthWarning(value);
    const num = parseFloat(value || '0');
    if (num >= 105 && num <= 200) {
      updateAlerts({ healthWarning: num });
    }
  };

  const handleHealthWarningBlur = () => {
    const num = parseFloat(healthWarning || '0');
    if (num < 105) {
      setHealthWarning('105');
      updateAlerts({ healthWarning: 105 });
      toast.error('Minimum health warning threshold is 105%');
    } else if (num > 200) {
      setHealthWarning('200');
      updateAlerts({ healthWarning: 200 });
      toast.error('Maximum health warning threshold is 200%');
    } else if (num <= parseFloat(healthCritical)) {
      setHealthWarning((parseFloat(healthCritical) + 5).toString());
      updateAlerts({ healthWarning: parseFloat(healthCritical) + 5 });
      toast.error('Warning threshold must be above critical threshold');
    } else {
      toast.success('Health warning threshold updated', { duration: 2000 });
    }
  };

  const handlePriceWarningChange = (value: string) => {
    setPriceWarning(value);
    const num = parseFloat(value || '0');
    if (num >= 1 && num <= 20) {
      updateAlerts({ priceDeviationWarning: num });
    }
  };

  const handlePriceWarningBlur = () => {
    const num = parseFloat(priceWarning || '0');
    if (num < 1) {
      setPriceWarning('1');
      updateAlerts({ priceDeviationWarning: 1 });
      toast.error('Minimum price warning deviation is 1%');
    } else if (num > 20) {
      setPriceWarning('20');
      updateAlerts({ priceDeviationWarning: 20 });
      toast.error('Maximum price warning deviation is 20%');
    } else if (num >= parseFloat(priceCritical)) {
      setPriceWarning((parseFloat(priceCritical) - 1).toString());
      updateAlerts({ priceDeviationWarning: parseFloat(priceCritical) - 1 });
      toast.error('Warning deviation must be below critical deviation');
    } else {
      toast.success('Price warning deviation updated', { duration: 2000 });
    }
  };

  const handlePriceCriticalChange = (value: string) => {
    setPriceCritical(value);
    const num = parseFloat(value || '0');
    if (num >= 2 && num <= 30) {
      updateAlerts({ priceDeviationCritical: num });
    }
  };

  const handlePriceCriticalBlur = () => {
    const num = parseFloat(priceCritical || '0');
    if (num < 2) {
      setPriceCritical('2');
      updateAlerts({ priceDeviationCritical: 2 });
      toast.error('Minimum price critical deviation is 2%');
    } else if (num > 30) {
      setPriceCritical('30');
      updateAlerts({ priceDeviationCritical: 30 });
      toast.error('Maximum price critical deviation is 30%');
    } else if (num <= parseFloat(priceWarning)) {
      setPriceCritical((parseFloat(priceWarning) + 1).toString());
      updateAlerts({ priceDeviationCritical: parseFloat(priceWarning) + 1 });
      toast.error('Critical deviation must be above warning deviation');
    } else {
      toast.success('Price critical deviation updated', { duration: 2000 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Factor Alerts */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Loan Health Factor Thresholds</h3>

        {/* Critical Threshold */}
        <div className="p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h4 className="text-sm font-medium text-white">Critical Threshold</h4>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={healthCritical}
                onChange={(e) => handleHealthCriticalChange(e.target.value)}
                onBlur={handleHealthCriticalBlur}
                step="1"
                min="100"
                max="150"
                className="w-20 px-3 py-2 bg-[#1E2329] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm text-[#848E9C]">%</span>
            </div>
          </div>
          <p className="text-xs text-[#848E9C]">
            Urgent alert when loan health factor drops below this level. Liquidation risk is very high.
          </p>
        </div>

        {/* Warning Threshold */}
        <div className="p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h4 className="text-sm font-medium text-white">Warning Threshold</h4>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={healthWarning}
                onChange={(e) => handleHealthWarningChange(e.target.value)}
                onBlur={handleHealthWarningBlur}
                step="1"
                min="105"
                max="200"
                className="w-20 px-3 py-2 bg-[#1E2329] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm text-[#848E9C]">%</span>
            </div>
          </div>
          <p className="text-xs text-[#848E9C]">
            Get notified when loan health factor drops below this level. Consider adding collateral.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setHealthCritical('110');
              setHealthWarning('120');
              updateAlerts({ healthCritical: 110, healthWarning: 120 });
              toast.success('Conservative thresholds set', { duration: 2000 });
            }}
            className="px-3 py-1.5 text-xs bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] rounded-lg hover:border-emerald-500/50 transition-colors"
          >
            Conservative (110% / 120%)
          </button>
          <button
            onClick={() => {
              setHealthCritical('105');
              setHealthWarning('115');
              updateAlerts({ healthCritical: 105, healthWarning: 115 });
              toast.success('Aggressive thresholds set', { duration: 2000 });
            }}
            className="px-3 py-1.5 text-xs bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] rounded-lg hover:border-emerald-500/50 transition-colors"
          >
            Aggressive (105% / 115%)
          </button>
        </div>
      </div>

      <div className="h-px bg-[#2B3139]" />

      {/* Price Deviation Alerts */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Oracle Price Deviation Thresholds</h3>

        {/* Warning Deviation */}
        <div className="p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h4 className="text-sm font-medium text-white">Warning Deviation</h4>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceWarning}
                onChange={(e) => handlePriceWarningChange(e.target.value)}
                onBlur={handlePriceWarningBlur}
                step="0.5"
                min="1"
                max="20"
                className="w-20 px-3 py-2 bg-[#1E2329] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm text-[#848E9C]">%</span>
            </div>
          </div>
          <p className="text-xs text-[#848E9C]">
            Alert when oracle price deviates by more than this percentage from expected value.
          </p>
        </div>

        {/* Critical Deviation */}
        <div className="p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h4 className="text-sm font-medium text-white">Critical Deviation</h4>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceCritical}
                onChange={(e) => handlePriceCriticalChange(e.target.value)}
                onBlur={handlePriceCriticalBlur}
                step="0.5"
                min="2"
                max="30"
                className="w-20 px-3 py-2 bg-[#1E2329] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm text-[#848E9C]">%</span>
            </div>
          </div>
          <p className="text-xs text-[#848E9C]">
            Urgent alert when oracle price deviates significantly. Oracle may need updating.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPriceWarning('5');
              setPriceCritical('8');
              updateAlerts({ priceDeviationWarning: 5, priceDeviationCritical: 8 });
              toast.success('Default deviations set', { duration: 2000 });
            }}
            className="px-3 py-1.5 text-xs bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] rounded-lg hover:border-emerald-500/50 transition-colors"
          >
            Default (5% / 8%)
          </button>
          <button
            onClick={() => {
              setPriceWarning('3');
              setPriceCritical('5');
              updateAlerts({ priceDeviationWarning: 3, priceDeviationCritical: 5 });
              toast.success('Sensitive deviations set', { duration: 2000 });
            }}
            className="px-3 py-1.5 text-xs bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] rounded-lg hover:border-emerald-500/50 transition-colors"
          >
            Sensitive (3% / 5%)
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-blue-400 font-medium">About Alert Thresholds</p>
            <p className="text-xs text-blue-300/80 mt-1">
              These thresholds determine when you receive notifications. Lower thresholds provide earlier warnings but may result in more frequent alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
