/**
 * NotificationSettings Component
 *
 * Allows users to configure notification preferences.
 */
'use client';

import { useUserSettings } from '@/lib/hooks/useUserSettings';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const { settings, updateNotifications } = useUserSettings();
  const notifications = settings.notifications;

  const handleToggle = (key: keyof typeof notifications) => {
    updateNotifications({ [key]: !notifications[key] });
    toast.success('Notification preferences updated', { duration: 2000 });
  };

  const toggleAll = () => {
    const newState = !notifications.enabled;
    updateNotifications({
      enabled: newState,
      loanMatched: newState,
      repaymentDue: newState,
      healthWarning: newState,
      healthCritical: newState,
      liquidationWarning: newState,
      priceDeviation: newState,
    });
    toast.success(
      newState ? 'All notifications enabled' : 'All notifications disabled',
      { duration: 2000 }
    );
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-emerald-500' : 'bg-[#2B3139]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
        <div>
          <h3 className="text-sm font-semibold text-white">Enable Notifications</h3>
          <p className="text-xs text-[#848E9C] mt-1">
            Master toggle for all notification types
          </p>
        </div>
        <ToggleSwitch enabled={notifications.enabled} onChange={toggleAll} />
      </div>

      {/* Individual Notification Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white mb-3">Notification Types</h3>

        {/* Loan Matched */}
        <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <h4 className="text-sm font-medium text-white">Loan Matched</h4>
            </div>
            <p className="text-xs text-[#848E9C] mt-1 ml-7">
              Get notified when your offer or request is matched
            </p>
          </div>
          <ToggleSwitch
            enabled={notifications.loanMatched}
            onChange={() => handleToggle('loanMatched')}
          />
        </div>

        {/* Repayment Due */}
        <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h4 className="text-sm font-medium text-white">Repayment Due</h4>
            </div>
            <p className="text-xs text-[#848E9C] mt-1 ml-7">
              Reminder when loan repayment is approaching due date
            </p>
          </div>
          <ToggleSwitch
            enabled={notifications.repaymentDue}
            onChange={() => handleToggle('repaymentDue')}
          />
        </div>

        {/* Health Warning */}
        <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h4 className="text-sm font-medium text-white">Health Warning</h4>
            </div>
            <p className="text-xs text-[#848E9C] mt-1 ml-7">
              Alert when loan health factor reaches warning threshold
            </p>
          </div>
          <ToggleSwitch
            enabled={notifications.healthWarning}
            onChange={() => handleToggle('healthWarning')}
          />
        </div>

        {/* Health Critical */}
        <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <h4 className="text-sm font-medium text-white">Health Critical</h4>
            </div>
            <p className="text-xs text-[#848E9C] mt-1 ml-7">
              Urgent alert when loan health is critically low
            </p>
          </div>
          <ToggleSwitch
            enabled={notifications.healthCritical}
            onChange={() => handleToggle('healthCritical')}
          />
        </div>

        {/* Liquidation Warning */}
        <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">💥</span>
              <h4 className="text-sm font-medium text-white">Liquidation Warning</h4>
            </div>
            <p className="text-xs text-[#848E9C] mt-1 ml-7">
              Alert when loan is at risk of liquidation
            </p>
          </div>
          <ToggleSwitch
            enabled={notifications.liquidationWarning}
            onChange={() => handleToggle('liquidationWarning')}
          />
        </div>

        {/* Price Deviation */}
        <div className="flex items-center justify-between p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h4 className="text-sm font-medium text-white">Price Deviation</h4>
            </div>
            <p className="text-xs text-[#848E9C] mt-1 ml-7">
              Alert when oracle price deviates significantly
            </p>
          </div>
          <ToggleSwitch
            enabled={notifications.priceDeviation}
            onChange={() => handleToggle('priceDeviation')}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-blue-400 font-medium">About Notifications</p>
            <p className="text-xs text-blue-300/80 mt-1">
              Notifications appear as toast messages in the app. Email and SMS notifications are not yet supported but will be added in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
