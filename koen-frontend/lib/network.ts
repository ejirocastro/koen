import { STACKS_TESTNET, STACKS_MAINNET, StacksNetwork } from '@stacks/network';

/**
 * Get the appropriate Stacks network based on environment
 */
export function getNetwork(): StacksNetwork {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';

  if (networkType === 'mainnet') {
    return STACKS_MAINNET;
  }

  return STACKS_TESTNET;
}

/**
 * Get the API URL for the current network
 */
export function getApiUrl(): string {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';

  if (networkType === 'mainnet') {
    return 'https://api.hiro.so';
  }

  return 'https://api.testnet.hiro.so';
}

/**
 * Get the explorer URL for the current network
 */
export function getExplorerUrl(): string {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return `https://explorer.hiro.so/?chain=${networkType}`;
}

/**
 * Check if we're on testnet
 */
export function isTestnet(): boolean {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return networkType === 'testnet';
}
