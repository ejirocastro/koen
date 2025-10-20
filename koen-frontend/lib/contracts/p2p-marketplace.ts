import {
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
  ClarityValue,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import { CONTRACTS, MARKETPLACE_CONSTANTS } from '../constants';
import { getNetwork } from '../network';
import {
  microKusdToKusd,
  kusdToMicroKusd,
  satoshisToSbtc,
  sbtcToSatoshis,
  bpsToPercentage,
  percentageToBps,
  daysToBlocks,
} from '../utils/format-helpers';
import { robustFetchReadOnly, safeReadOnlyCall } from '../network/api-client';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Represents a lending offer in the P2P marketplace
 * Lenders create offers specifying how much kUSD they want to lend
 * and the terms (APR, duration, collateral requirements)
 */
export interface LendingOffer {
  offerId: number;
  lender: string;
  amount: number; // In kUSD
  apr: number; // Percentage (e.g., 5.8)
  duration: number; // In blocks
  minReputation: number;
  collateralRatio: number; // Percentage (e.g., 150)
  status: string;
  createdAt: number; // Block height
  sbtcPriceSnapshot: number; // In USD (8 decimals)
}

/**
 * Represents a borrow request in the P2P marketplace
 * Borrowers create requests specifying how much kUSD they need
 * and deposit sBTC as collateral
 */
export interface BorrowRequest {
  requestId: number;
  borrower: string;
  amount: number; // In kUSD
  maxApr: number; // Percentage
  duration: number; // In blocks
  collateralDeposited: number; // In sBTC
  reputationScore: number;
  status: string;
  createdAt: number; // Block height
  sbtcPriceSnapshot: number; // In USD
}

/**
 * Represents an active loan created when an offer is matched with a request
 * Tracks the loan lifecycle from creation to repayment or liquidation
 */
export interface ActiveLoan {
  loanId: number;
  offerId: number;
  requestId: number;
  lender: string;
  borrower: string;
  amount: number; // In kUSD
  apr: number; // Percentage
  duration: number; // In blocks
  startBlock: number;
  endBlock: number;
  collateral: number; // In sBTC
  collateralRatio: number; // Percentage (e.g., 150)
  status: string;
  repaidAmount: number; // In kUSD
}

/**
 * Marketplace-wide statistics tracked on-chain
 * Used for displaying platform health and activity metrics
 */
export interface MarketplaceStats {
  totalOffersCreated: number;
  totalRequestsCreated: number;
  totalLoansCreated: number;
  totalVolumeLent: number; // In kUSD
  totalInterestEarned: number; // In kUSD
  totalVolume: number; // Alias for totalVolumeLent
  totalLoans: number; // Alias for totalLoansCreated
  activeOffers: number; // Placeholder - would need separate query
  activeRequests: number; // Placeholder - would need separate query
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get a lending offer by ID
 *
 * Fetches a specific lending offer from the blockchain by its unique ID.
 * Returns null if the offer doesn't exist or has been deleted.
 *
 * @param offerId - Unique identifier for the lending offer
 * @param network - Stacks network configuration (testnet/mainnet)
 * @returns Promise resolving to the lending offer or null if not found
 */
export async function getLendingOffer(
  offerId: number,
  network: StacksNetwork
): Promise<LendingOffer | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-lending-offer',
      [uintCV(offerId)],
      network
    );

    // Contract returns (ok (some {...})) or (ok none)
    // Parsed: {type: "(response ...)", value: {type: "(optional ...)", value: {...}}}
    console.log(`[getLendingOffer] Offer #${offerId} response:`, data);

    if (!data || !data.value || data.value.type === 'none') {
      console.log(`[getLendingOffer] Offer #${offerId} not found or none`);
      return null;
    }

    // Unwrap response -> unwrap optional -> get the tuple
    const offerTuple = data.value.value;

    // The tuple has another .value nested inside
    const offer = offerTuple.value;

    console.log(`[getLendingOffer] Offer #${offerId} fields:`, offer);

    // Additional validation - check if offer has required fields
    if (!offer || !offer.lender || !offer.amount || !offer.status) {
      console.log(`[getLendingOffer] Offer #${offerId} missing required fields`);
      return null;
    }

    console.log(`[getLendingOffer] ✓ Offer #${offerId} valid, status:`, offer.status.value);

    return {
      offerId,
      lender: offer.lender.value,
      amount: microKusdToKusd(BigInt(offer.amount.value)),
      apr: bpsToPercentage(Number(offer.apr.value)),
      duration: Number(offer.duration.value),
      minReputation: Number(offer['min-reputation'].value),
      collateralRatio: Number(offer['collateral-ratio'].value) / 100,
      status: offer.status.value,
      createdAt: Number(offer['created-at'].value),
      sbtcPriceSnapshot: Number(offer['sbtc-price-snapshot'].value) / 100_000_000,
    };
  } catch (error) {
    console.error('Error fetching lending offer:', error);
    return null;
  }
}

/**
 * Get a borrow request by ID
 *
 * Fetches a specific borrow request from the blockchain by its unique ID.
 * Returns null if the request doesn't exist or has been deleted.
 *
 * @param requestId - Unique identifier for the borrow request
 * @param network - Stacks network configuration (testnet/mainnet)
 * @returns Promise resolving to the borrow request or null if not found
 */
export async function getBorrowRequest(
  requestId: number,
  network: StacksNetwork
): Promise<BorrowRequest | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-borrow-request',
      [uintCV(requestId)],
      network
    );

    // Contract returns (ok (some {...})) or (ok none)
    if (!data || !data.value || data.value.type === 'none') {
      return null;
    }

    // Unwrap response -> unwrap optional -> get the tuple
    const requestTuple = data.value.value;

    // The tuple has another .value nested inside
    const request = requestTuple.value;

    // Additional validation - check if request has required fields
    if (!request || !request.borrower || !request.amount || !request.status) {
      return null;
    }

    return {
      requestId,
      borrower: request.borrower.value,
      amount: microKusdToKusd(BigInt(request.amount.value)),
      maxApr: bpsToPercentage(Number(request['max-apr'].value)),
      duration: Number(request.duration.value),
      collateralDeposited: satoshisToSbtc(BigInt(request['collateral-deposited'].value)),
      reputationScore: Number(request['reputation-score'].value),
      status: request.status.value,
      createdAt: Number(request['created-at'].value),
      sbtcPriceSnapshot: Number(request['sbtc-price-snapshot'].value) / 100_000_000,
    };
  } catch (error) {
    console.error('Error fetching borrow request:', error);
    return null;
  }
}

/**
 * Get an active loan by ID
 */
export async function getActiveLoan(
  loanId: number,
  network: StacksNetwork
): Promise<ActiveLoan | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-active-loan',
      [uintCV(loanId)],
      network
    );

    // Contract returns (ok (map-get?...))
    if (!data.success || !data.value || data.value.type === 'none') {
      return null;
    }

    // Unwrap the optional
    const loan = data.value.value;

    if (!loan || !loan.lender || !loan.borrower) {
      return null;
    }

    const startBlock = Number(loan['start-block'].value);
    const endBlock = Number(loan['end-block'].value);
    const duration = endBlock - startBlock;

    return {
      loanId,
      offerId: Number(loan['offer-id'].value),
      requestId: Number(loan['request-id'].value),
      lender: loan.lender.value,
      borrower: loan.borrower.value,
      amount: microKusdToKusd(BigInt(loan['principal-amount'].value)), // FIXED: principal-amount
      apr: bpsToPercentage(Number(loan['interest-rate'].value)), // FIXED: interest-rate
      duration,
      startBlock,
      endBlock,
      collateral: satoshisToSbtc(BigInt(loan['collateral-amount'].value)), // FIXED: collateral-amount
      collateralRatio: 150, // Calculate from collateral and amount if needed
      status: loan.status.value,
      repaidAmount: 0, // Active loans don't have repaid amount in the map
    };
  } catch (error) {
    console.error('Error fetching active loan:', error);
    return null;
  }
}

/**
 * Get the next offer ID (useful for determining the range of offers to fetch)
 */
export async function getNextOfferIds(
  network: StacksNetwork
): Promise<{ nextId: number } | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-next-offer-ids',
      [uintCV(1)], // count parameter (not used in response)
      network
    );

    if (!data || !data.value || !data.value.value) {
      console.error('[getNextOfferIds] Invalid response');
      return null;
    }

    // Response: (ok {next-id: uint, count: uint})
    // Parsed: {type: "(response ...)", value: {type: "(tuple ...)", value: {next-id: {...}, count: {...}}}}
    const tupleData = data.value.value;
    const nextIdValue = tupleData['next-id'];

    if (!nextIdValue) {
      console.error('[getNextOfferIds] next-id not found');
      return null;
    }

    const nextId = Number(nextIdValue.value);
    console.log('[getNextOfferIds] ✓ Next offer ID:', nextId);

    return { nextId };
  } catch (error) {
    console.error('Error fetching next offer IDs:', error);
    return null;
  }
}

/**
 * Get the next request ID
 */
export async function getNextRequestIds(
  network: StacksNetwork
): Promise<{ nextId: number } | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-next-request-ids',
      [uintCV(1)],
      network
    );

    if (!data || !data.value || !data.value.value) {
      return null;
    }

    const tupleData = data.value.value;
    const nextIdValue = tupleData['next-id'];

    if (!nextIdValue) {
      return null;
    }

    return {
      nextId: Number(nextIdValue.value),
    };
  } catch (error) {
    console.error('Error fetching next request IDs:', error);
    return null;
  }
}

/**
 * Get marketplace statistics
 */
export async function getMarketplaceStats(
  network: StacksNetwork
): Promise<MarketplaceStats | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-marketplace-stats',
      [],
      network
    );

    console.log('[getMarketplaceStats] Raw data:', JSON.stringify(data, null, 2));

    // Contract returns (ok {...}) - stats tuple is in data.value.value
    if (!data.success || !data.value) {
      console.error('[getMarketplaceStats] Data validation failed:', { success: data.success, hasValue: !!data.value });
      return null;
    }

    // Extract the tuple (needs double .value like other contract calls)
    const stats = data.value.value;
    console.log('[getMarketplaceStats] Stats object:', JSON.stringify(stats, null, 2));

    const totalVolumeLent = microKusdToKusd(BigInt(stats['total-volume-lent']?.value || 0));
    const totalLoansCreated = Number(stats['total-loans-created']?.value || 0);

    const result = {
      totalOffersCreated: Number(stats['total-offers-created']?.value || 0),
      totalRequestsCreated: Number(stats['total-requests-created']?.value || 0),
      totalLoansCreated,
      totalVolumeLent,
      totalInterestEarned: microKusdToKusd(BigInt(stats['total-interest-earned']?.value || 0)),
      // Aliases for compatibility
      totalVolume: totalVolumeLent,
      totalLoans: totalLoansCreated,
      // Placeholders - would need to count actual active offers/requests
      activeOffers: 0,
      activeRequests: 0,
    };

    console.log('[getMarketplaceStats] ✅ Returning stats:', result);
    return result;
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    return null;
  }
}

/**
 * Get loan health factor
 */
export async function getLoanHealthFactor(
  loanId: number,
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-loan-health-factor',
      [uintCV(loanId)],
      network
    );

    // Contract returns (ok uint)
    if (!data.success || !data.value) {
      return null;
    }

    // Health factor is returned in basis points (e.g., 15000 = 150%)
    return Number(data.value.value) / 100;
  } catch (error) {
    console.error('Error fetching loan health factor:', error);
    return null;
  }
}

/**
 * Check if loan is liquidatable
 */
export async function isLoanLiquidatable(
  loanId: number,
  network: StacksNetwork
): Promise<boolean> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'is-loan-liquidatable',
      [uintCV(loanId)],
      network
    );

    // Contract returns (ok bool)
    return data.success && data.value && data.value.value === true;
  } catch (error) {
    console.error('Error checking if loan is liquidatable:', error);
    return false;
  }
}

/**
 * Get current debt for a loan (principal + interest)
 */
export async function getLoanCurrentDebt(
  loanId: number,
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-loan-current-debt',
      [uintCV(loanId)],
      network
    );

    // Contract returns (ok uint)
    if (!data.success || !data.value) {
      return null;
    }

    return microKusdToKusd(BigInt(data.value.value));
  } catch (error) {
    console.error('Error fetching loan current debt:', error);
    return null;
  }
}

/**
 * Get user's active loans (as lender or borrower)
 */
export async function getUserActiveLoans(
  userAddress: string,
  network: StacksNetwork
): Promise<number[]> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-user-active-loans',
      [principalCV(userAddress)],
      network
    );

    // Contract returns (ok (list ...)) or (ok (some (list ...)))
    if (!data.success || !data.value) {
      return [];
    }

    // Handle optional wrapper if present
    const list = data.value.type === 'some' ? data.value.value : data.value;

    if (!list || !Array.isArray(list)) {
      return [];
    }

    // Extract loan IDs from the list
    return list.map((item: any) => Number(item.value));
  } catch (error) {
    console.error('Error fetching user active loans:', error);
    return [];
  }
}

// ============================================
// WRITE FUNCTIONS (TRANSACTIONS)
// ============================================

/**
 * Create a lending offer
 *
 * Submits a transaction to create a new lending offer on the blockchain.
 * The user must have sufficient kUSD balance to cover the offer amount.
 * The offer will be locked in the contract until matched or cancelled.
 *
 * IMPORTANT: Requires oracle price to be fresh (updated within last 144 blocks)
 *
 * @param params - Lending offer parameters
 * @param params.amount - Amount of kUSD to lend (in kUSD, e.g. 1000.50)
 * @param params.apr - Annual percentage rate (e.g. 5.8 for 5.8%)
 * @param params.duration - Loan duration in days (e.g. 90)
 * @param params.minReputation - Minimum reputation score required (0-100)
 * @param params.collateralRatio - Required collateral ratio as percentage (e.g. 150 for 150%)
 * @returns Promise resolving to transaction ID
 * @throws Error if transaction is cancelled or fails
 */
export async function createLendingOffer(params: {
  amount: number; // In kUSD
  apr: number; // Percentage (e.g., 5.8)
  duration: number; // In days
  minReputation: number;
  collateralRatio: number; // Percentage (e.g., 150)
}): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  // Import network helper
  const { getNetwork } = await import('../network');
  const network = getNetwork();

  // Convert to contract format
  const amountMicro = kusdToMicroKusd(params.amount);
  const aprBps = percentageToBps(params.apr);
  const durationBlocks = daysToBlocks(params.duration);
  const collateralRatioBps = Math.floor(params.collateralRatio * 100);

  const functionArgs = [
    uintCV(amountMicro.toString()),
    uintCV(aprBps),
    uintCV(durationBlocks),
    uintCV(params.minReputation),
    uintCV(collateralRatioBps),
  ];

  return new Promise((resolve, reject) => {
    const options = {
      network, // CRITICAL: Explicitly set network to testnet
      contractAddress,
      contractName,
      functionName: 'create-lending-offer',
      functionArgs,
      postConditionMode: PostConditionMode.Allow, // Allow mode for easier testing
      onFinish: (data: any) => {
        console.log('Transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}

/**
 * Create a borrow request
 *
 * Submits a transaction to create a new borrow request on the blockchain.
 * The user must have sufficient sBTC balance to deposit as collateral.
 * The collateral will be locked in the contract until the loan is repaid or liquidated.
 *
 * IMPORTANT: Requires oracle price to be fresh (updated within last 144 blocks)
 *
 * @param params - Borrow request parameters
 * @param params.amount - Amount of kUSD to borrow (in kUSD, e.g. 1000.50)
 * @param params.maxApr - Maximum acceptable APR (e.g. 6.5 for 6.5%)
 * @param params.duration - Loan duration in days (e.g. 90)
 * @param params.collateralAmount - Amount of sBTC to deposit (in sBTC, e.g. 0.05)
 * @returns Promise resolving to transaction ID
 * @throws Error if transaction is cancelled or fails
 */
export async function createBorrowRequest(params: {
  amount: number; // In kUSD
  maxApr: number; // In basis points (already converted from percentage)
  duration: number; // In blocks (already converted from days)
  collateralAmount: number; // In sBTC
}): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  // Import network helper
  const { getNetwork } = await import('../network');
  const network = getNetwork();

  const amountMicro = kusdToMicroKusd(params.amount);
  const maxAprBps = params.maxApr; // Already converted to bps in create page
  const durationBlocks = params.duration; // Already converted to blocks in create page
  const collateralSatoshis = sbtcToSatoshis(params.collateralAmount);

  const functionArgs = [
    uintCV(amountMicro.toString()),
    uintCV(maxAprBps),
    uintCV(durationBlocks),
    uintCV(collateralSatoshis.toString()),
  ];

  return new Promise((resolve, reject) => {
    const options = {
      network, // CRITICAL: Explicitly set network to testnet
      contractAddress,
      contractName,
      functionName: 'create-borrow-request',
      functionArgs,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}

/**
 * Match an offer to a request
 *
 * Creates an active loan by matching a lending offer with a borrow request.
 * Can only be called by the lender or borrower (prevents griefing).
 *
 * Security checks performed:
 * - Authorization: Only lender or borrower can execute
 * - Age limits: Rejects if offer/request is >10 days old (1440 blocks)
 * - Price deviation: Rejects if sBTC price moved >10% since creation
 *
 * @param offerId - ID of the lending offer to match
 * @param requestId - ID of the borrow request to match
 * @returns Promise resolving to transaction ID
 * @throws Error if security checks fail or transaction is cancelled
 */
export async function matchOfferToRequest(
  offerId: number,
  requestId: number
): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');
  const network = getNetwork();

  const functionArgs = [uintCV(offerId), uintCV(requestId)];

  return new Promise((resolve, reject) => {
    const options = {
      network,
      contractAddress,
      contractName,
      functionName: 'match-offer-to-request',
      functionArgs,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Match transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}

/**
 * Cancel a lending offer
 */
export async function cancelLendingOffer(offerId: number): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');
  const network = getNetwork();

  return new Promise((resolve, reject) => {
    const options = {
      network,
      contractAddress,
      contractName,
      functionName: 'cancel-lending-offer',
      functionArgs: [uintCV(offerId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Cancel offer transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}

/**
 * Cancel a borrow request
 */
export async function cancelBorrowRequest(requestId: number): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');
  const network = getNetwork();

  return new Promise((resolve, reject) => {
    const options = {
      network,
      contractAddress,
      contractName,
      functionName: 'cancel-borrow-request',
      functionArgs: [uintCV(requestId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Cancel request transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}

/**
 * Repay a loan
 *
 * Fully repays a loan including principal and accrued interest.
 * Upon successful repayment, collateral is returned to the borrower.
 * Must be called by the borrower before the loan end block to avoid liquidation.
 *
 * @param loanId - ID of the loan to repay
 * @returns Promise resolving to transaction ID
 * @throws Error if insufficient kUSD balance or transaction fails
 */
export async function repayLoan(loanId: number): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');
  const network = getNetwork();

  return new Promise((resolve, reject) => {
    const options = {
      network,
      contractAddress,
      contractName,
      functionName: 'repay-loan',
      functionArgs: [uintCV(loanId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Repay loan transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}

/**
 * Liquidate a loan
 *
 * Liquidates an underwater loan where collateral value has fallen below 110% of debt.
 * Anyone can call this function to liquidate unhealthy loans.
 * Liquidator receives a 5% bonus from the collateral.
 *
 * Liquidation conditions:
 * - Loan has passed its end block (overdue), OR
 * - Health factor < 110% (collateral value / debt < 1.10)
 *
 * @param loanId - ID of the loan to liquidate
 * @returns Promise resolving to transaction ID
 * @throws Error if loan is not liquidatable or transaction fails
 */
export async function liquidateLoan(loanId: number): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');
  const network = getNetwork();

  return new Promise((resolve, reject) => {
    const options = {
      network,
      contractAddress,
      contractName,
      functionName: 'liquidate-loan',
      functionArgs: [uintCV(loanId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Liquidate loan transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}
