// Contract addresses - Testnet Deployment
// Deployed on: 2025-10-13
// Network: Stacks Testnet
export const CONTRACTS = {
  // Your deployed contracts on testnet
  P2P_MARKETPLACE: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.p2p-marketplace',
  KUSD_TOKEN: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.kusd-token',
  REPUTATION_SBT: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.reputation-sbt',
  ORACLE: 'ST7QHJ8ST6C8YBWVMN0CJDDNSGJQQ4S8QYGFGHN3.oracle',

  // Official testnet sBTC (automatically remapped by Clarinet)
  SBTC_TOKEN: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token',
} as const;

// Protocol constants (from smart contract)
export const MARKETPLACE_CONSTANTS = {
  // Time conversions
  BLOCKS_PER_DAY: 144,
  BLOCKS_PER_YEAR: 52560,

  // Slippage protection (Hybrid approach)
  MAX_OFFER_AGE_BLOCKS: 1440,        // ~10 days max age for offers/requests
  MAX_PRICE_DEVIATION_BPS: 1000,     // 10% maximum price deviation from snapshot

  // Liquidation parameters
  LIQUIDATION_THRESHOLD: 8000,       // 80% health factor threshold (below this = liquidatable)
  LIQUIDATION_BONUS: 500,            // 5% bonus for liquidators

  // Limits
  MAX_APR: 10000,                    // 100% maximum APR
  MIN_COLLATERAL_RATIO: 10000,       // 100% minimum collateral
  MAX_LOAN_DURATION: 262800,         // ~5 years maximum loan duration
  MAX_PRICE_AGE_BLOCKS: 144,         // 24 hours max price staleness

  // Conversion factors
  BASIS_POINTS_DIVISOR: 10000,       // Divide by this to get percentage (580 bps → 5.8%)
  KUSD_DECIMALS: 6,                  // kUSD uses 6 decimals (1,000,000 = 1 kUSD)
  SBTC_DECIMALS: 8,                  // sBTC uses 8 decimals (100,000,000 = 1 sBTC)
} as const;

// Reputation tiers
export const REPUTATION_TIERS = {
  BRONZE: {
    name: 'Bronze',
    min: 0,
    max: 499,
    bonus: 0,
    multiplier: 0,
    color: '#CD7F32',
    description: 'Entry level - No APR discount',
  },
  SILVER: {
    name: 'Silver',
    min: 500,
    max: 999,
    bonus: 0.10,          // 10% APR discount
    multiplier: 1000,     // 1000 basis points
    color: '#C0C0C0',
    description: '10% APR discount on all loans',
  },
  GOLD: {
    name: 'Gold',
    min: 1000,
    max: Infinity,
    bonus: 0.20,          // 20% APR discount
    multiplier: 2000,     // 2000 basis points
    color: '#FFD700',
    description: '20% APR discount on all loans',
  },
} as const;

// Contract status constants (match smart contract string-ascii values)
export const CONTRACT_STATUS = {
  // Offer/Request statuses
  OPEN: 'open',
  MATCHED: 'matched',
  CANCELLED: 'cancelled',

  // Loan statuses
  ACTIVE: 'active',
  REPAID: 'repaid',
  LIQUIDATED: 'liquidated',
  DEFAULTED: 'defaulted',
} as const;

// Error codes from smart contract
export const ERROR_CODES: Record<number, string> = {
  // Authorization errors
  401: 'Unauthorized - You do not have permission to perform this action',
  402: 'Protocol is paused - Trading temporarily disabled',

  // Validation errors
  501: 'Invalid amount - Amount must be greater than zero',
  502: 'Invalid APR - APR must be between 0% and 100%',
  503: 'Invalid duration - Duration must be positive',
  504: 'Invalid collateral ratio - Collateral ratio must be at least 100%',

  // Not found errors
  505: 'Offer not found - This lending offer does not exist',
  506: 'Request not found - This borrow request does not exist',
  507: 'Loan not found - This loan does not exist',

  // Status errors
  508: 'Offer not open - This offer has been matched or cancelled',
  509: 'Request not open - This request has been matched or cancelled',
  514: 'Loan not active - This loan has been repaid or liquidated',

  // Matching errors
  510: 'Insufficient reputation - Borrower does not meet minimum reputation requirement',
  511: 'Insufficient collateral - More collateral required for this loan amount',
  512: 'APR too high - Offer APR exceeds borrower\'s maximum acceptable APR',
  513: 'Terms mismatch - Offer and request terms are incompatible',

  // Loan operation errors
  515: 'Not lender - Only the lender can perform this action',
  516: 'Not borrower - Only the borrower can perform this action',
  517: 'Loan not due - Loan has not reached maturity yet',
  518: 'Not liquidatable - Loan health factor is above liquidation threshold (80%)',

  // Oracle errors
  519: 'Oracle failure - Unable to fetch sBTC price from oracle',
  520: 'Stale price - Oracle price is too old (>24 hours)',
  521: 'Borrow amount exceeds limit - Amount exceeds maximum borrowing capacity',

  // Slippage protection errors (Hybrid approach)
  522: 'Offer expired - Offer is older than 10 days. Create a new offer.',
  523: 'Request expired - Borrow request is older than 10 days. Create a new request.',
  524: 'Price deviation too large - sBTC price moved more than 10% since creation. This match is rejected for your protection.',
} as const;

// Helper function to get error message
export function getErrorMessage(errorCode: number | string): string {
  const code = typeof errorCode === 'string' ? parseInt(errorCode) : errorCode;
  return ERROR_CODES[code] || `Unknown error (code: ${code})`;
}

// Network configuration
export const NETWORK_CONFIG = {
  TESTNET: {
    name: 'testnet',
    coreApiUrl: 'https://api.testnet.hiro.so',
  },
  MAINNET: {
    name: 'mainnet',
    coreApiUrl: 'https://api.hiro.so',
  },
} as const;

// Get current network based on environment
export function getCurrentNetwork() {
  const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
  return isMainnet ? NETWORK_CONFIG.MAINNET : NETWORK_CONFIG.TESTNET;
}

// UI Constants
export const UI_CONSTANTS = {
  // Pagination
  ITEMS_PER_PAGE: 20,

  // Refresh intervals (milliseconds)
  MARKET_DATA_REFRESH: 30000,      // 30 seconds
  LOAN_HEALTH_REFRESH: 10000,      // 10 seconds
  LIQUIDATION_MONITOR_REFRESH: 10000, // 10 seconds

  // Health factor color thresholds
  HEALTH_CRITICAL: 110,            // Below 110% = critical (red)
  HEALTH_WARNING: 120,             // 110-120% = warning (yellow)
  HEALTH_SAFE: 150,                // Above 150% = safe (green)

  // Price deviation warning thresholds
  PRICE_DEVIATION_WARNING: 5,      // 5% = show warning
  PRICE_DEVIATION_CRITICAL: 8,     // 8% = show strong warning

  // Age warnings (blocks)
  AGE_WARNING: 1152,               // 8 days (warn when approaching expiry)
  AGE_CRITICAL: 1296,              // 9 days (critical - expires in 1 day)
} as const;

// Type helpers
export type ReputationTier = 'bronze' | 'silver' | 'gold';
export type ContractStatus = typeof CONTRACT_STATUS[keyof typeof CONTRACT_STATUS];

// Helper function to get reputation tier from score
export function getReputationTierFromScore(score: number): ReputationTier {
  if (score >= REPUTATION_TIERS.GOLD.min) return 'gold';
  if (score >= REPUTATION_TIERS.SILVER.min) return 'silver';
  return 'bronze';
}

// Helper function to get tier details
export function getTierDetails(tier: ReputationTier) {
  const tierKey = tier.toUpperCase() as keyof typeof REPUTATION_TIERS;
  return REPUTATION_TIERS[tierKey];
}
