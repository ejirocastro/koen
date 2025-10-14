'use client';

import { useQuery } from '@tanstack/react-query';
import { getNetwork } from '../network';
import { getKusdBalance } from '../contracts/kusd-token';
import { getSbtcBalance } from '../contracts/sbtc-token';

/**
 * Hook to fetch kUSD balance for an address
 */
export function useKusdBalance(address: string | null) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['kusd-balance', address],
    queryFn: async (): Promise<number> => {
      if (!address) return 0;
      try {
        return await getKusdBalance(address, network);
      } catch (error) {
        console.warn('Failed to fetch kUSD balance:', error);
        return 0; // Return 0 if API is down
      }
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch sBTC balance for an address
 */
export function useSbtcBalance(address: string | null) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['sbtc-balance', address],
    queryFn: async (): Promise<number> => {
      if (!address) return 0;
      try {
        return await getSbtcBalance(address, network);
      } catch (error) {
        console.warn('Failed to fetch sBTC balance:', error);
        return 0; // Return 0 if API is down
      }
    },
    enabled: !!address,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Combined hook to get both token balances
 */
export function useTokenBalances(address: string | null) {
  const kusdQuery = useKusdBalance(address);
  const sbtcQuery = useSbtcBalance(address);

  return {
    kusd: kusdQuery.data || 0,
    sbtc: sbtcQuery.data || 0,
    isLoading: kusdQuery.isLoading || sbtcQuery.isLoading,
    error: kusdQuery.error || sbtcQuery.error,
  };
}
