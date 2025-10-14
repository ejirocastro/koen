import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
  ClarityValue,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import { CONTRACTS, MARKETPLACE_CONSTANTS } from '../constants';
import {
  microKusdToKusd,
  kusdToMicroKusd,
  satoshisToSbtc,
  sbtcToSatoshis,
  bpsToPercentage,
  percentageToBps,
  daysToBlocks,
} from '../utils/format-helpers';

// ============================================
// TYPE DEFINITIONS
// ============================================

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
 */
export async function getLendingOffer(
  offerId: number,
  network: StacksNetwork
): Promise<LendingOffer | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-lending-offer',
      functionArgs: [uintCV(offerId)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // If result is none, return null
    if (!data.value || data.value === null) {
      return null;
    }

    // Parse the tuple response
    const offer = data.value;

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
 */
export async function getBorrowRequest(
  requestId: number,
  network: StacksNetwork
): Promise<BorrowRequest | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-borrow-request',
      functionArgs: [uintCV(requestId)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    if (!data.value || data.value === null) {
      return null;
    }

    const request = data.value;

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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-active-loan',
      functionArgs: [uintCV(loanId)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    if (!data.value || data.value === null) {
      return null;
    }

    const loan = data.value;

    const startBlock = Number(loan['start-block'].value);
    const endBlock = Number(loan['end-block'].value);
    const duration = endBlock - startBlock;

    return {
      loanId,
      offerId: Number(loan['offer-id'].value),
      requestId: Number(loan['request-id'].value),
      lender: loan.lender.value,
      borrower: loan.borrower.value,
      amount: microKusdToKusd(BigInt(loan.amount.value)),
      apr: bpsToPercentage(Number(loan.apr.value)),
      duration,
      startBlock,
      endBlock,
      collateral: satoshisToSbtc(BigInt(loan.collateral.value)),
      collateralRatio: Number(loan['collateral-ratio']?.value || 150), // Default to 150% if not present
      status: loan.status.value,
      repaidAmount: microKusdToKusd(BigInt(loan['repaid-amount'].value)),
    };
  } catch (error) {
    console.error('Error fetching active loan:', error);
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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-marketplace-stats',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let stats = data.value;
    if (stats && stats.value) {
      stats = stats.value;
    }

    if (!stats) {
      return null;
    }

    const totalVolumeLent = microKusdToKusd(BigInt(stats['total-volume-lent']?.value || 0));
    const totalLoansCreated = Number(stats['total-loans-created']?.value || 0);

    return {
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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-loan-health-factor',
      functionArgs: [uintCV(loanId)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let healthFactor = data.value;
    if (healthFactor && typeof healthFactor === 'object' && healthFactor.value !== undefined) {
      healthFactor = healthFactor.value;
    }

    if (!healthFactor) {
      return null;
    }

    // Health factor is returned in basis points (e.g., 15000 = 150%)
    return Number(healthFactor) / 100;
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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-loan-liquidatable',
      functionArgs: [uintCV(loanId)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);
    return data.value === true;
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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-loan-current-debt',
      functionArgs: [uintCV(loanId)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let debt = data.value;
    if (debt && typeof debt === 'object' && debt.value !== undefined) {
      debt = debt.value;
    }

    if (!debt) {
      return null;
    }

    return microKusdToKusd(BigInt(debt));
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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-user-active-loans',
      functionArgs: [principalCV(userAddress)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    if (!data.value || !Array.isArray(data.value)) {
      return [];
    }

    // Extract loan IDs from the list
    return data.value.map((item: any) => Number(item.value));
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
 */
export async function createLendingOffer(params: {
  amount: number; // In kUSD
  apr: number; // Percentage (e.g., 5.8)
  duration: number; // In days
  minReputation: number;
  collateralRatio: number; // Percentage (e.g., 150)
}): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

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

  const options = {
    contractAddress,
    contractName,
    functionName: 'create-lending-offer',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      console.log('Transaction cancelled');
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Create a borrow request
 */
export async function createBorrowRequest(params: {
  amount: number; // In kUSD
  maxApr: number; // Percentage
  duration: number; // In days
  collateralAmount: number; // In sBTC
}): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const amountMicro = kusdToMicroKusd(params.amount);
  const maxAprBps = percentageToBps(params.maxApr);
  const durationBlocks = daysToBlocks(params.duration);
  const collateralSatoshis = sbtcToSatoshis(params.collateralAmount);

  const functionArgs = [
    uintCV(amountMicro.toString()),
    uintCV(maxAprBps),
    uintCV(durationBlocks),
    uintCV(collateralSatoshis.toString()),
  ];

  const options = {
    contractAddress,
    contractName,
    functionName: 'create-borrow-request',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Match an offer to a request
 */
export async function matchOfferToRequest(
  offerId: number,
  requestId: number
): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const functionArgs = [uintCV(offerId), uintCV(requestId)];

  const options = {
    contractAddress,
    contractName,
    functionName: 'match-offer-to-request',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Match transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Cancel a lending offer
 */
export async function cancelLendingOffer(offerId: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const options = {
    contractAddress,
    contractName,
    functionName: 'cancel-lending-offer',
    functionArgs: [uintCV(offerId)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Cancel offer transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Cancel a borrow request
 */
export async function cancelBorrowRequest(requestId: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const options = {
    contractAddress,
    contractName,
    functionName: 'cancel-borrow-request',
    functionArgs: [uintCV(requestId)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Cancel request transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Repay a loan
 */
export async function repayLoan(loanId: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const options = {
    contractAddress,
    contractName,
    functionName: 'repay-loan',
    functionArgs: [uintCV(loanId)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Repay loan transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Liquidate a loan
 */
export async function liquidateLoan(loanId: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const options = {
    contractAddress,
    contractName,
    functionName: 'liquidate-loan',
    functionArgs: [uintCV(loanId)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Liquidate loan transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}
