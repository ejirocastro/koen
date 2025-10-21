/**
 * TradingSettings Component
 *
 * Allows users to configure trading preferences and defaults.
 */
'use client';

import { useState } from 'react';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { bpsToPercentage, blocksToDays } from '@/lib/utils/format-helpers';
import toast from 'react-hot-toast';

export default function TradingSettings() {
  const { settings, updateTrading } = useUserSettings();
  const trading = settings.trading;

  const [slippage, setSlippage] = useState((trading.slippageTolerance / 100).toString());
  const [duration, setDuration] = useState(blocksToDays(trading.defaultDuration).toString());
  const [collateralRatio, setCollateralRatio] = useState((trading.defaultCollateralRatio / 100).toString());

  const handleSlippageChange = (value: string) => {
    setSlippage(value);
    const bps = Math.round(parseFloat(value || '0') * 100);
    if (bps >= 10 && bps <= 5000) {
      updateTrading({ slippageTolerance: bps });
    }
  };

  const handleSlippageBlur = () => {
    const bps = Math.round(parseFloat(slippage || '0') * 100);
    if (bps < 10) {
      setSlippage('0.1');
      updateTrading({ slippageTolerance: 10 });
      toast.error('Minimum slippage is 0.1%');
    } else if (bps > 5000) {
      setSlippage('50');
      updateTrading({ slippageTolerance: 5000 });
      toast.error('Maximum slippage is 50%');
    } else {
      toast.success('Slippage tolerance updated', { duration: 2000 });
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    const days = parseInt(value || '0');
    const blocks = Math.round(days * 144); // 144 blocks per day
    if (days >= 1 && days <= 365) {
      updateTrading({ defaultDuration: blocks });
    }
  };

  const handleDurationBlur = () => {
    const days = parseInt(duration || '0');
    if (days < 1) {
      setDuration('1');
      updateTrading({ defaultDuration: 144 });
      toast.error('Minimum duration is 1 day');
    } else if (days > 365) {
      setDuration('365');
      updateTrading({ defaultDuration: 52560 });
      toast.error('Maximum duration is 365 days');
    } else {
      toast.success('Default duration updated', { duration: 2000 });
    }
  };

  const handleCollateralChange = (value: string) => {
    setCollateralRatio(value);
    const bps = Math.round(parseFloat(value || '0') * 100);
    if (bps >= 10000 && bps <= 50000) {
      updateTrading({ defaultCollateralRatio: bps });
    }
  };

  const handleCollateralBlur = () => {
    const bps = Math.round(parseFloat(collateralRatio || '0') * 100);
    if (bps < 10000) {
      setCollateralRatio('100');
      updateTrading({ defaultCollateralRatio: 10000 });
      toast.error('Minimum collateral ratio is 100%');
    } else if (bps > 50000) {
      setCollateralRatio('500');
      updateTrading({ defaultCollateralRatio: 50000 });
      toast.error('Maximum collateral ratio is 500%');
    } else {
      toast.success('Default collateral ratio updated', { duration: 2000 });
    }
  };

  const handleAutoApproveToggle = () => {
    updateTrading({ autoApproveSmallTx: !trading.autoApproveSmallTx });
    toast.success('Auto-approve preference updated', { duration: 2000 });
  };

  return (
    <div className="space-y-6">
      {/* Slippage Tolerance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Slippage Tolerance</h3>
            <p className="text-xs text-[#848E9C] mt-1">
              Maximum acceptable price deviation for transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={slippage}
              onChange={(e) => handleSlippageChange(e.target.value)}
              onBlur={handleSlippageBlur}
              step="0.1"
              min="0.1"
              max="50"
              className="w-20 px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
            />
            <span className="text-sm text-[#848E9C]">%</span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          {[0.1, 0.5, 1.0, 5.0, 10.0].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setSlippage(preset.toString());
                updateTrading({ slippageTolerance: preset * 100 });
                toast.success(`Slippage set to ${preset}%`, { duration: 2000 });
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                parseFloat(slippage) === preset
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-emerald-500/50'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>

        {/* Warning */}
        {parseFloat(slippage) > 5 && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-orange-400">
                High slippage tolerance may result in unfavorable trades. Consider using a lower value.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-[#2B3139]" />

      {/* Default Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Default Loan Duration</h3>
            <p className="text-xs text-[#848E9C] mt-1">
              Pre-filled duration when creating offers or requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              onBlur={handleDurationBlur}
              step="1"
              min="1"
              max="365"
              className="w-20 px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
            />
            <span className="text-sm text-[#848E9C]">days</span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          {[7, 14, 30, 60, 90].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setDuration(preset.toString());
                updateTrading({ defaultDuration: preset * 144 });
                toast.success(`Duration set to ${preset} days`, { duration: 2000 });
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                parseInt(duration) === preset
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-emerald-500/50'
              }`}
            >
              {preset}d
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2B3139]" />

      {/* Default Collateral Ratio */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Default Collateral Ratio</h3>
            <p className="text-xs text-[#848E9C] mt-1">
              Pre-filled collateral ratio for borrow requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={collateralRatio}
              onChange={(e) => handleCollateralChange(e.target.value)}
              onBlur={handleCollateralBlur}
              step="1"
              min="100"
              max="500"
              className="w-20 px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded-lg text-white text-sm text-right focus:outline-none focus:border-emerald-500"
            />
            <span className="text-sm text-[#848E9C]">%</span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          {[120, 150, 200, 250, 300].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setCollateralRatio(preset.toString());
                updateTrading({ defaultCollateralRatio: preset * 100 });
                toast.success(`Collateral ratio set to ${preset}%`, { duration: 2000 });
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                parseInt(collateralRatio) === preset
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-emerald-500/50'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2B3139]" />

      {/* Auto-Approve Small Transactions */}
      <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
        <div>
          <h3 className="text-sm font-semibold text-white">Auto-Approve Small Transactions</h3>
          <p className="text-xs text-[#848E9C] mt-1">
            Skip confirmation for transactions under 10 kUSD (Coming Soon)
          </p>
        </div>
        <button
          onClick={handleAutoApproveToggle}
          disabled
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors opacity-50 cursor-not-allowed ${
            trading.autoApproveSmallTx ? 'bg-emerald-500' : 'bg-[#2B3139]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              trading.autoApproveSmallTx ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-blue-400 font-medium">Trading Preferences</p>
            <p className="text-xs text-blue-300/80 mt-1">
              These settings provide default values when creating new offers or requests. You can always override them on the Create page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
