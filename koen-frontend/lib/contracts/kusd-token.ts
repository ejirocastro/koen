import {
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import { CONTRACTS } from '../constants';
import { microKusdToKusd, kusdToMicroKusd } from '../utils/format-helpers';
import { robustFetchReadOnly } from '../network/api-client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  tokenUri: string;
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get kUSD balance for an address
 */
export async function getKusdBalance(
  address: string,
  network: StacksNetwork
): Promise<number> {
  try {
    const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-balance',
      [principalCV(address)],
      network
    );

    // Handle response wrapper - could be data.value.value or data.value
    let balance = data.value;
    if (balance && typeof balance === 'object' && balance.value !== undefined) {
      balance = balance.value;
    }

    if (!balance) {
      return 0;
    }

    return microKusdToKusd(BigInt(balance));
  } catch (error) {
    console.error('Error fetching kUSD balance:', error);
    return 0;
  }
}

/**
 * Get token metadata
 */
export async function getKusdMetadata(
  network: StacksNetwork
): Promise<TokenMetadata | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

    // Get name
    const nameData = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-name',
      [],
      network
    );

    // Get symbol
    const symbolData = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-symbol',
      [],
      network
    );

    // Get decimals
    const decimalsData = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-decimals',
      [],
      network
    );

    // Get token URI
    const uriData = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-token-uri',
      [],
      network
    );

    return {
      name: nameData.value?.value || 'Koen USD',
      symbol: symbolData.value?.value || 'kUSD',
      decimals: Number(decimalsData.value?.value) || 6,
      tokenUri: uriData.value?.value || '',
    };
  } catch (error) {
    console.error('Error fetching kUSD metadata:', error);
    return null;
  }
}

/**
 * Get total supply of kUSD
 */
export async function getKusdTotalSupply(
  network: StacksNetwork
): Promise<number> {
  try {
    const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

    const data = await robustFetchReadOnly(
      contractAddress,
      contractName,
      'get-total-supply',
      [],
      network
    );

    // Handle response wrapper - could be data.value.value or data.value
    let supply = data.value;
    if (supply && typeof supply === 'object' && supply.value !== undefined) {
      supply = supply.value;
    }

    if (!supply) {
      return 0;
    }

    return microKusdToKusd(BigInt(supply));
  } catch (error) {
    console.error('Error fetching kUSD total supply:', error);
    return 0;
  }
}

// ============================================
// WRITE FUNCTIONS (TRANSACTIONS)
// ============================================

/**
 * Transfer kUSD to another address
 */
export async function transferKusd(params: {
  amount: number; // In kUSD
  recipient: string;
  memo?: string;
}): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

  const amountMicro = kusdToMicroKusd(params.amount);

  const functionArgs = [
    uintCV(amountMicro.toString()),
    principalCV(params.recipient),
    // TODO: Add memo parameter if contract supports it
  ];

  return new Promise((resolve, reject) => {
    const options = {
      contractAddress,
      contractName,
      functionName: 'transfer',
      functionArgs,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('kUSD transfer transaction submitted:', data.txId);
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
 * Mint kUSD (test/faucet function - only available in testnet)
 * Note: This may not be available in production
 */
export async function mintKusd(amount: number): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

  const amountMicro = kusdToMicroKusd(amount);

  return new Promise((resolve, reject) => {
    const options = {
      contractAddress,
      contractName,
      functionName: 'mint',
      functionArgs: [uintCV(amountMicro.toString())],
      postConditionMode: PostConditionMode.Allow, // Allow for faucet
      onFinish: (data: any) => {
        console.log('kUSD mint transaction submitted:', data.txId);
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
 * Request kUSD from faucet (if available)
 * This is a common pattern for testnet tokens
 */
export async function requestKusdFaucet(): Promise<{ txId: string }> {
  const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

  // Import network helper
  const { getNetwork } = await import('../network');
  const network = getNetwork();

  return new Promise((resolve, reject) => {
    // Try to call faucet function (common name)
    const options = {
      network, // CRITICAL: Explicitly set network to testnet
      contractAddress,
      contractName,
      functionName: 'faucet',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('kUSD faucet transaction submitted:', data.txId);
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled by user'));
      },
    };

    openContractCall(options);
  });
}
