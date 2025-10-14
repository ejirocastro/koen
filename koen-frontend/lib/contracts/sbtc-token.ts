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
import { satoshisToSbtc, sbtcToSatoshis } from '../utils/format-helpers';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SbtcMetadata {
  name: string;
  symbol: string;
  decimals: number;
  tokenUri: string;
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get sBTC balance for an address
 */
export async function getSbtcBalance(
  address: string,
  network: StacksNetwork
): Promise<number> {
  try {
    const [contractAddress, contractName] = CONTRACTS.SBTC_TOKEN.split('.');

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

    return satoshisToSbtc(BigInt(balance));
  } catch (error) {
    console.error('Error fetching sBTC balance:', error);
    return 0;
  }
}

/**
 * Get token metadata
 */
export async function getSbtcMetadata(
  network: StacksNetwork
): Promise<SbtcMetadata | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.SBTC_TOKEN.split('.');

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
      name: nameData.value?.value || 'Stacked Bitcoin',
      symbol: symbolData.value?.value || 'sBTC',
      decimals: Number(decimalsData.value?.value) || 8,
      tokenUri: uriData.value?.value || '',
    };
  } catch (error) {
    console.error('Error fetching sBTC metadata:', error);
    return null;
  }
}

/**
 * Get total supply of sBTC
 */
export async function getSbtcTotalSupply(
  network: StacksNetwork
): Promise<number> {
  try {
    const [contractAddress, contractName] = CONTRACTS.SBTC_TOKEN.split('.');

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

    return satoshisToSbtc(BigInt(supply));
  } catch (error) {
    console.error('Error fetching sBTC total supply:', error);
    return 0;
  }
}

// ============================================
// WRITE FUNCTIONS (TRANSACTIONS)
// ============================================

/**
 * Transfer sBTC to another address
 */
export async function transferSbtc(params: {
  amount: number; // In sBTC
  recipient: string;
  memo?: string;
}): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.SBTC_TOKEN.split('.');

  const amountSatoshis = sbtcToSatoshis(params.amount);

  const functionArgs = [
    uintCV(amountSatoshis.toString()),
    principalCV(params.recipient),
  ];

  const options = {
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('sBTC transfer transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Mint sBTC (test/faucet function - only available in testnet)
 */
export async function mintSbtc(amount: number): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.SBTC_TOKEN.split('.');

  const amountSatoshis = sbtcToSatoshis(amount);

  const options = {
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [uintCV(amountSatoshis.toString())],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('sBTC mint transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Request sBTC from faucet
 */
export async function requestSbtcFaucet(): Promise<any> {
  const [contractAddress, contractName] = CONTRACTS.SBTC_TOKEN.split('.');

  const options = {
    contractAddress,
    contractName,
    functionName: 'faucet',
    functionArgs: [],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('sBTC faucet transaction submitted:', data.txId);
      return data;
    },
    onCancel: () => {
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}
