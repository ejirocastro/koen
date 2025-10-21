/**
 * Settings Helpers
 *
 * Helper functions to bridge user settings with application constants.
 * Allows user preferences to override default values while maintaining fallbacks.
 */

import { UserSettings } from '@/lib/hooks/useUserSettings';
import { UI_CONSTANTS } from '@/lib/constants';

/**
 * Get UI constants with user settings overrides
 *
 * Returns a constants object that prioritizes user settings when available,
 * falling back to default UI_CONSTANTS if settings are not provided.
 *
 * @param userSettings - Optional user settings from useUserSettings hook
 * @returns Object containing all UI constants with user overrides applied
 */
export function getUIConstants(userSettings?: UserSettings) {
  if (!userSettings) {
    return UI_CONSTANTS;
  }

  return {
    // Pagination (not user-configurable)
    ITEMS_PER_PAGE: UI_CONSTANTS.ITEMS_PER_PAGE,

    // Refresh intervals (user-configurable via display settings)
    MARKET_DATA_REFRESH: userSettings.display.refreshIntervalMarket,
    LOAN_HEALTH_REFRESH: userSettings.display.refreshIntervalLoans,
    LIQUIDATION_MONITOR_REFRESH: userSettings.display.refreshIntervalLoans,

    // Health factor thresholds (user-configurable via alert settings)
    HEALTH_CRITICAL: userSettings.alerts.healthCritical,
    HEALTH_WARNING: userSettings.alerts.healthWarning,
    HEALTH_SAFE: 150, // Not configurable - always safe above 150%

    // Price deviation thresholds (user-configurable via alert settings)
    PRICE_DEVIATION_WARNING: userSettings.alerts.priceDeviationWarning,
    PRICE_DEVIATION_CRITICAL: userSettings.alerts.priceDeviationCritical,

    // Age warnings (not user-configurable)
    AGE_WARNING: UI_CONSTANTS.AGE_WARNING,
    AGE_CRITICAL: UI_CONSTANTS.AGE_CRITICAL,
  } as const;
}

/**
 * Get health status based on health factor percentage
 *
 * Uses user's configured thresholds to determine health status.
 *
 * @param healthFactor - Health factor as percentage (e.g., 115 = 115%)
 * @param userSettings - Optional user settings
 * @returns 'critical' | 'warning' | 'safe'
 */
export function getHealthStatus(
  healthFactor: number,
  userSettings?: UserSettings
): 'critical' | 'warning' | 'safe' {
  const constants = getUIConstants(userSettings);

  if (healthFactor < constants.HEALTH_CRITICAL) {
    return 'critical';
  }
  if (healthFactor < constants.HEALTH_WARNING) {
    return 'warning';
  }
  return 'safe';
}

/**
 * Get health color class based on health factor
 *
 * @param healthFactor - Health factor as percentage
 * @param userSettings - Optional user settings
 * @returns Tailwind color class
 */
export function getHealthColor(
  healthFactor: number,
  userSettings?: UserSettings
): string {
  const status = getHealthStatus(healthFactor, userSettings);

  switch (status) {
    case 'critical':
      return 'text-red-500';
    case 'warning':
      return 'text-yellow-500';
    case 'safe':
      return 'text-green-500';
  }
}

/**
 * Get health background color class based on health factor
 *
 * @param healthFactor - Health factor as percentage
 * @param userSettings - Optional user settings
 * @returns Tailwind background color class
 */
export function getHealthBgColor(
  healthFactor: number,
  userSettings?: UserSettings
): string {
  const status = getHealthStatus(healthFactor, userSettings);

  switch (status) {
    case 'critical':
      return 'bg-red-500/10 border-red-500/30';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'safe':
      return 'bg-green-500/10 border-green-500/30';
  }
}

/**
 * Get price deviation status
 *
 * @param deviationPercent - Price deviation as percentage (e.g., 6 = 6%)
 * @param userSettings - Optional user settings
 * @returns 'critical' | 'warning' | 'normal'
 */
export function getPriceDeviationStatus(
  deviationPercent: number,
  userSettings?: UserSettings
): 'critical' | 'warning' | 'normal' {
  const constants = getUIConstants(userSettings);

  if (deviationPercent >= constants.PRICE_DEVIATION_CRITICAL) {
    return 'critical';
  }
  if (deviationPercent >= constants.PRICE_DEVIATION_WARNING) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Check if a notification should be shown based on user preferences
 *
 * @param notificationType - Type of notification to check
 * @param userSettings - Optional user settings
 * @returns true if notification should be shown
 */
export function shouldShowNotification(
  notificationType: keyof UserSettings['notifications'],
  userSettings?: UserSettings
): boolean {
  if (!userSettings) {
    return true; // Show all notifications if settings not loaded
  }

  // Check if notifications are globally enabled
  if (!userSettings.notifications.enabled) {
    return false;
  }

  // Check specific notification type (except 'enabled' which is the master toggle)
  if (notificationType === 'enabled') {
    return true;
  }

  return userSettings.notifications[notificationType];
}
