import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import { CONTRACTS } from '../constants';
import { microKusdToKusd, kusdToMicroKusd } from '../utils/format-helpers';

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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-balance',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

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
    const nameResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-name',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    // Get symbol
    const symbolResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-symbol',
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

    // Get token URI
    const uriResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-token-uri',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const nameData = cvToJSON(nameResult);
    const symbolData = cvToJSON(symbolResult);
    const decimalsData = cvToJSON(decimalsResult);
    const uriData = cvToJSON(uriResult);

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

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-total-supply',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });

    const data = cvToJSON(result);

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
}): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

  const amountMicro = kusdToMicroKusd(params.amount);

  const functionArgs = [
    uintCV(amountMicro.toString()),
    principalCV(params.recipient),
    // TODO: Add memo parameter if contract supports it
  ];

  const options = {
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('kUSD transfer transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Mint kUSD (test/faucet function - only available in testnet)
 * Note: This may not be available in production
 */
export async function mintKusd(amount: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

  const amountMicro = kusdToMicroKusd(amount);

  const options = {
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [uintCV(amountMicro.toString())],
    postConditionMode: PostConditionMode.Allow, // Allow for faucet
    onFinish: (data: any) => {
      console.log('kUSD mint transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Request kUSD from faucet (if available)
 * This is a common pattern for testnet tokens
 */
export async function requestKusdFaucet(): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.KUSD_TOKEN.split('.');

  // Try to call faucet function (common name)
  const options = {
    contractAddress,
    contractName,
    functionName: 'faucet',
    functionArgs: [],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('kUSD faucet transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}
