/**
 * useUserSettings Hook
 *
 * Manages user settings and preferences with localStorage persistence.
 * Provides typed settings access and update functions.
 */
import { useState, useEffect } from 'react';

// Settings interface
export interface UserSettings {
  notifications: {
    enabled: boolean;
    loanMatched: boolean;
    repaymentDue: boolean;
    healthWarning: boolean;
    healthCritical: boolean;
    liquidationWarning: boolean;
    priceDeviation: boolean;
  };
  trading: {
    slippageTolerance: number; // in basis points (1000 = 10%)
    defaultDuration: number; // in blocks
    defaultCollateralRatio: number; // in basis points
    autoApproveSmallTx: boolean;
  };
  alerts: {
    healthCritical: number; // percentage (110 = 110%)
    healthWarning: number; // percentage (120 = 120%)
    priceDeviationWarning: number; // percentage (5 = 5%)
    priceDeviationCritical: number; // percentage (8 = 8%)
  };
  display: {
    refreshIntervalMarket: number; // milliseconds
    refreshIntervalLoans: number; // milliseconds
  };
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    enabled: true,
    loanMatched: true,
    repaymentDue: true,
    healthWarning: true,
    healthCritical: true,
    liquidationWarning: true,
    priceDeviation: true,
  },
  trading: {
    slippageTolerance: 1000, // 10%
    defaultDuration: 1440, // 10 days in blocks
    defaultCollateralRatio: 15000, // 150%
    autoApproveSmallTx: false,
  },
  alerts: {
    healthCritical: 110, // 110%
    healthWarning: 120, // 120%
    priceDeviationWarning: 5, // 5%
    priceDeviationCritical: 8, // 8%
  },
  display: {
    refreshIntervalMarket: 30000, // 30 seconds
    refreshIntervalLoans: 10000, // 10 seconds
  },
};

const STORAGE_KEY = 'koen_user_settings';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: UserSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  };

  // Update specific section
  const updateNotifications = (notifications: Partial<UserSettings['notifications']>) => {
    saveSettings({
      ...settings,
      notifications: { ...settings.notifications, ...notifications },
    });
  };

  const updateTrading = (trading: Partial<UserSettings['trading']>) => {
    saveSettings({
      ...settings,
      trading: { ...settings.trading, ...trading },
    });
  };

  const updateAlerts = (alerts: Partial<UserSettings['alerts']>) => {
    saveSettings({
      ...settings,
      alerts: { ...settings.alerts, ...alerts },
    });
  };

  const updateDisplay = (display: Partial<UserSettings['display']>) => {
    saveSettings({
      ...settings,
      display: { ...settings.display, ...display },
    });
  };

  // Reset to defaults
  const resetSettings = () => {
    saveSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    isLoading,
    updateNotifications,
    updateTrading,
    updateAlerts,
    updateDisplay,
    resetSettings,
  };
}
