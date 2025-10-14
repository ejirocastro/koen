import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import { CONTRACTS, MARKETPLACE_CONSTANTS } from '../constants';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface OracleData {
  price: number; // In USD (e.g., 40000.00)
  lastUpdateBlock: number;
  decimals: number;
  isFresh: boolean;
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get current sBTC price from oracle
 */
export async function getSbtcPrice(
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-sbtc-price',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let price = data.value;
    if (price && typeof price === 'object' && price.value !== undefined) {
      price = price.value;
    }

    if (!price) {
      return null;
    }

    // Price is stored with 8 decimals (like sBTC)
    // e.g., 4000000000000 = $40,000.00
    return Number(price) / 100_000_000;
  } catch (error) {
    console.error('Error fetching sBTC price:', error);
    return null;
  }
}

/**
 * Get oracle data including price and metadata
 */
export async function getOracleData(
  network: StacksNetwork,
  currentBlock?: number
): Promise<OracleData | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    // Get price
    const priceResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-sbtc-price',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    // Get last update block
    const lastUpdateResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-last-update-block',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    // Get decimals
    const decimalsResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-decimals',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    // Check if price is fresh
    const isFreshResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-price-fresh',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const priceData = cvToJSON(priceResult);
    const lastUpdateData = cvToJSON(lastUpdateResult);
    const decimalsData = cvToJSON(decimalsResult);
    const isFreshData = cvToJSON(isFreshResult);

    // Handle response wrapper for price
    let priceValue = priceData.value;
    if (priceValue && typeof priceValue === 'object' && priceValue.value !== undefined) {
      priceValue = priceValue.value;
    }

    if (!priceValue) {
      return null;
    }

    const price = Number(priceValue) / 100_000_000;
    const lastUpdateBlock = Number(lastUpdateData.value?.value) || 0;
    const decimals = Number(decimalsData.value?.value) || 8;
    const isFresh = isFreshData.value === true;

    return {
      price,
      lastUpdateBlock,
      decimals,
      isFresh,
    };
  } catch (error) {
    console.error('Error fetching oracle data:', error);
    return null;
  }
}

/**
 * Get sBTC price at a specific block (if available)
 */
export async function getSbtcPriceAtBlock(
  blockHeight: number,
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-price-at-block',
      functionArgs: [uintCV(blockHeight)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let price = data.value;
    if (price && typeof price === 'object' && price.value !== undefined) {
      price = price.value;
    }

    if (!price) {
      return null;
    }

    return Number(price) / 100_000_000;
  } catch (error) {
    console.error('Error fetching sBTC price at block:', error);
    return null;
  }
}

/**
 * Calculate USD value of sBTC amount
 */
export async function getSbtcValueInUsd(
  sbtcAmount: number,
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    // Convert sBTC to satoshis (8 decimals)
    const satoshis = Math.floor(sbtcAmount * 100_000_000);

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-sbtc-value',
      functionArgs: [uintCV(satoshis)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let value = data.value;
    if (value && typeof value === 'object' && value.value !== undefined) {
      value = value.value;
    }

    if (!value) {
      return null;
    }

    // Result is in USD with 8 decimals
    return Number(value) / 100_000_000;
  } catch (error) {
    console.error('Error calculating sBTC value:', error);
    return null;
  }
}

/**
 * Calculate sBTC amount needed for USD value
 */
export async function getSbtcAmountForUsd(
  usdValue: number,
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    // Convert USD to 8 decimal format
    const usdWith8Decimals = Math.floor(usdValue * 100_000_000);

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-sbtc-amount',
      functionArgs: [uintCV(usdWith8Decimals)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let amount = data.value;
    if (amount && typeof amount === 'object' && amount.value !== undefined) {
      amount = amount.value;
    }

    if (!amount) {
      return null;
    }

    // Result is in satoshis, convert to sBTC
    return Number(amount) / 100_000_000;
  } catch (error) {
    console.error('Error calculating sBTC amount:', error);
    return null;
  }
}

/**
 * Check if oracle price is fresh (< 144 blocks old)
 */
export async function isPriceFresh(
  network: StacksNetwork
): Promise<boolean> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-price-fresh',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);
    return data.value === true;
  } catch (error) {
    console.error('Error checking if price is fresh:', error);
    return false;
  }
}

/**
 * Check if price is stale (> 144 blocks old)
 */
export async function isPriceStale(
  network: StacksNetwork,
  currentBlock: number
): Promise<boolean> {
  try {
    const oracleData = await getOracleData(network, currentBlock);

    if (!oracleData) {
      return true; // Consider stale if can't fetch
    }

    const blocksSinceUpdate = currentBlock - oracleData.lastUpdateBlock;
    return blocksSinceUpdate > MARKETPLACE_CONSTANTS.MAX_PRICE_AGE_BLOCKS;
  } catch (error) {
    console.error('Error checking if price is stale:', error);
    return true;
  }
}

/**
 * Get last update block height
 */
export async function getLastUpdateBlock(
  network: StacksNetwork
): Promise<number | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-last-update-block',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

    // Handle response wrapper - could be data.value.value or data.value
    let block = data.value;
    if (block && typeof block === 'object' && block.value !== undefined) {
      block = block.value;
    }

    if (!block) {
      return null;
    }

    return Number(block);
  } catch (error) {
    console.error('Error fetching last update block:', error);
    return null;
  }
}

// ============================================
// WRITE FUNCTIONS (TRANSACTIONS)
// ============================================

/**
 * Update sBTC price in oracle
 * Note: This is typically restricted to oracle admin/owner
 */
export async function updateSbtcPrice(newPrice: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.ORACLE.split('.');

  // Convert price to 8 decimals format
  // e.g., 40000.00 → 4000000000000
  const priceWith8Decimals = Math.floor(newPrice * 100_000_000);

  const options = {
    contractAddress,
    contractName,
    functionName: 'set-sbtc-price',
    functionArgs: [uintCV(priceWith8Decimals)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Update sBTC price transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format price for display
 */
export function formatOraclePrice(price: number): string {
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate time since last update
 */
export function getTimeSinceUpdate(
  lastUpdateBlock: number,
  currentBlock: number
): string {
  const blocksSinceUpdate = currentBlock - lastUpdateBlock;
  const minutesEstimate = blocksSinceUpdate * 10; // ~10 min per block

  if (minutesEstimate < 60) {
    return `${minutesEstimate} minutes ago`;
  }

  const hoursEstimate = Math.floor(minutesEstimate / 60);
  if (hoursEstimate < 24) {
    return `${hoursEstimate} hour${hoursEstimate === 1 ? '' : 's'} ago`;
  }

  const daysEstimate = Math.floor(hoursEstimate / 24);
  return `${daysEstimate} day${daysEstimate === 1 ? '' : 's'} ago`;
}
