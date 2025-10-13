import { MARKETPLACE_CONSTANTS } from '../constants';

/**
 * Convert blocks to days
 * @param blocks Number of blocks
 * @returns Number of days
 */
export function blocksToDays(blocks: number): number {
  return Math.floor(blocks / MARKETPLACE_CONSTANTS.BLOCKS_PER_DAY);
}

/**
 * Convert days to blocks
 * @param days Number of days
 * @returns Number of blocks
 */
export function daysToBlocks(days: number): number {
  return days * MARKETPLACE_CONSTANTS.BLOCKS_PER_DAY;
}

/**
 * Convert basis points to percentage
 * @param bps Basis points (e.g., 580)
 * @returns Percentage (e.g., 5.8)
 */
export function bpsToPercentage(bps: number): number {
  return bps / 100;
}

/**
 * Convert percentage to basis points
 * @param percentage Percentage (e.g., 5.8)
 * @returns Basis points (e.g., 580)
 */
export function percentageToBps(percentage: number): number {
  return Math.floor(percentage * 100);
}

/**
 * Convert micro kUSD to kUSD (6 decimals)
 * @param microKusd Amount in micro kUSD
 * @returns Amount in kUSD
 */
export function microKusdToKusd(microKusd: bigint | number): number {
  const amount = typeof microKusd === 'bigint' ? Number(microKusd) : microKusd;
  return amount / 1_000_000;
}

/**
 * Convert kUSD to micro kUSD (6 decimals)
 * @param kusd Amount in kUSD
 * @returns Amount in micro kUSD
 */
export function kusdToMicroKusd(kusd: number): bigint {
  return BigInt(Math.floor(kusd * 1_000_000));
}

/**
 * Convert satoshis to sBTC (8 decimals)
 * @param satoshis Amount in satoshis
 * @returns Amount in sBTC
 */
export function satoshisToSbtc(satoshis: bigint | number): number {
  const amount = typeof satoshis === 'bigint' ? Number(satoshis) : satoshis;
  return amount / 100_000_000;
}

/**
 * Convert sBTC to satoshis (8 decimals)
 * @param sbtc Amount in sBTC
 * @returns Amount in satoshis
 */
export function sbtcToSatoshis(sbtc: number): bigint {
  return BigInt(Math.floor(sbtc * 100_000_000));
}

/**
 * Format currency amount
 * @param amount Amount to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1,234.56")
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format USD amount with dollar sign
 * @param amount Amount to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatUsd(amount: number, decimals: number = 2): string {
  return `$${formatCurrency(amount, decimals)}`;
}

/**
 * Format percentage
 * @param percentage Percentage to format (e.g., 5.8)
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "5.8%")
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format blocks remaining as time estimate
 * @param blocksRemaining Number of blocks remaining
 * @returns Human-readable time estimate
 */
export function formatTimeRemaining(blocksRemaining: number): string {
  const days = blocksToDays(blocksRemaining);

  if (days === 0) return '< 1 day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}

/**
 * Format Stacks address (truncate middle)
 * @param address Full Stacks address
 * @param prefixLength Characters to show at start (default: 6)
 * @param suffixLength Characters to show at end (default: 4)
 * @returns Truncated address (e.g., "SP4F3...8KL2")
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Calculate health factor percentage
 * @param collateralValue Value of collateral in USD
 * @param debtAmount Debt amount in USD
 * @returns Health factor as percentage (e.g., 150 for 150%)
 */
export function calculateHealthFactor(
  collateralValue: number,
  debtAmount: number
): number {
  if (debtAmount === 0) return Infinity;
  return (collateralValue / debtAmount) * 100;
}

/**
 * Calculate collateral ratio
 * @param collateralValue Value of collateral in USD
 * @param loanAmount Loan amount in USD
 * @returns Collateral ratio as percentage
 */
export function calculateCollateralRatio(
  collateralValue: number,
  loanAmount: number
): number {
  if (loanAmount === 0) return Infinity;
  return (collateralValue / loanAmount) * 100;
}

/**
 * Calculate price deviation percentage
 * @param currentPrice Current price
 * @param snapshotPrice Original snapshot price
 * @returns Deviation percentage (absolute value)
 */
export function calculatePriceDeviation(
  currentPrice: number,
  snapshotPrice: number
): number {
  if (snapshotPrice === 0) return 0;
  return Math.abs((currentPrice - snapshotPrice) / snapshotPrice) * 100;
}

/**
 * Calculate interest accrued
 * @param principal Loan principal amount
 * @param apr Annual percentage rate (e.g., 5.8 for 5.8%)
 * @param blocksElapsed Blocks elapsed since loan start
 * @returns Interest amount accrued
 */
export function calculateInterest(
  principal: number,
  apr: number,
  blocksElapsed: number
): number {
  const yearsElapsed = blocksElapsed / MARKETPLACE_CONSTANTS.BLOCKS_PER_YEAR;
  return principal * (apr / 100) * yearsElapsed;
}

/**
 * Calculate total repayment amount
 * @param principal Loan principal amount
 * @param apr Annual percentage rate
 * @param duration Loan duration in blocks
 * @returns Total repayment amount (principal + interest)
 */
export function calculateTotalRepayment(
  principal: number,
  apr: number,
  duration: number
): number {
  const interest = calculateInterest(principal, apr, duration);
  return principal + interest;
}

/**
 * Calculate effective APR after reputation discount
 * @param baseApr Base APR percentage
 * @param reputationBonus Reputation bonus (0, 0.10, or 0.20)
 * @returns Effective APR after discount
 */
export function calculateEffectiveApr(
  baseApr: number,
  reputationBonus: number
): number {
  return baseApr * (1 - reputationBonus);
}

/**
 * Calculate liquidation bonus
 * @param collateralAmount Collateral amount
 * @returns Liquidation bonus (5% of collateral)
 */
export function calculateLiquidationBonus(collateralAmount: number): number {
  return collateralAmount * (MARKETPLACE_CONSTANTS.LIQUIDATION_BONUS / MARKETPLACE_CONSTANTS.BASIS_POINTS_DIVISOR);
}

/**
 * Check if offer/request has expired
 * @param createdAt Block height when created
 * @param currentBlock Current block height
 * @returns True if expired (age > MAX_OFFER_AGE_BLOCKS)
 */
export function isExpired(createdAt: number, currentBlock: number): boolean {
  const age = currentBlock - createdAt;
  return age > MARKETPLACE_CONSTANTS.MAX_OFFER_AGE_BLOCKS;
}

/**
 * Calculate blocks remaining until expiry
 * @param createdAt Block height when created
 * @param currentBlock Current block height
 * @returns Blocks remaining (0 if expired)
 */
export function getBlocksUntilExpiry(
  createdAt: number,
  currentBlock: number
): number {
  const age = currentBlock - createdAt;
  const remaining = MARKETPLACE_CONSTANTS.MAX_OFFER_AGE_BLOCKS - age;
  return Math.max(0, remaining);
}

/**
 * Get health status category
 * @param healthFactor Health factor percentage
 * @returns Status category
 */
export function getHealthStatus(healthFactor: number): {
  status: 'critical' | 'warning' | 'safe';
  color: string;
  label: string;
} {
  if (healthFactor < 110) {
    return {
      status: 'critical',
      color: '#F6465D',
      label: 'Critical Risk',
    };
  }
  if (healthFactor < 120) {
    return {
      status: 'warning',
      color: '#F0B90B',
      label: 'At Risk',
    };
  }
  return {
    status: 'safe',
    color: '#0ECB81',
    label: 'Healthy',
  };
}

/**
 * Get risk level based on health factor
 * @param healthFactor Health factor percentage
 * @returns Risk level
 */
export function getRiskLevel(healthFactor: number): {
  level: 'critical' | 'high' | 'medium' | 'low';
  timeToLiquidation: string;
} {
  if (healthFactor < 110) {
    return { level: 'critical', timeToLiquidation: '< 1 hour' };
  }
  if (healthFactor < 120) {
    return { level: 'high', timeToLiquidation: '1-24 hours' };
  }
  if (healthFactor < 150) {
    return { level: 'medium', timeToLiquidation: '1-7 days' };
  }
  return { level: 'low', timeToLiquidation: 'N/A' };
}

/**
 * Format block height as date/time estimate
 * @param blockHeight Block height
 * @param currentBlock Current block height
 * @returns Estimated date/time string
 */
export function formatBlockAsDate(
  blockHeight: number,
  currentBlock: number
): string {
  const blocksDifference = blockHeight - currentBlock;

  if (blocksDifference <= 0) {
    return 'Now';
  }

  const minutesEstimate = blocksDifference * 10; // ~10 min per block
  const hoursEstimate = Math.floor(minutesEstimate / 60);
  const daysEstimate = Math.floor(hoursEstimate / 24);

  if (daysEstimate > 0) {
    return `in ~${daysEstimate} day${daysEstimate === 1 ? '' : 's'}`;
  }
  if (hoursEstimate > 0) {
    return `in ~${hoursEstimate} hour${hoursEstimate === 1 ? '' : 's'}`;
  }
  return `in ~${minutesEstimate} minute${minutesEstimate === 1 ? '' : 's'}`;
}

/**
 * Validate loan parameters
 * @param params Loan parameters
 * @returns Validation result
 */
export function validateLoanParams(params: {
  amount: number;
  apr: number;
  duration: number;
  collateralRatio?: number;
}): { valid: boolean; error?: string } {
  if (params.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  if (params.apr < 0 || params.apr > 100) {
    return { valid: false, error: 'APR must be between 0% and 100%' };
  }

  if (params.duration <= 0) {
    return { valid: false, error: 'Duration must be positive' };
  }

  const durationBlocks = daysToBlocks(params.duration);
  if (durationBlocks > MARKETPLACE_CONSTANTS.MAX_LOAN_DURATION) {
    const maxDays = blocksToDays(MARKETPLACE_CONSTANTS.MAX_LOAN_DURATION);
    return { valid: false, error: `Duration cannot exceed ${maxDays} days` };
  }

  if (params.collateralRatio !== undefined && params.collateralRatio < 100) {
    return { valid: false, error: 'Collateral ratio must be at least 100%' };
  }

  return { valid: true };
}
