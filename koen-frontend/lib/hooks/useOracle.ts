/**
 * Oracle hooks for price data and freshness checks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getNetwork } from '../network';
import { getOracleData, getLastUpdateBlock } from '../contracts/oracle';

/**
 * Hook to check if oracle price is fresh
 * Returns true if price was updated within last 144 blocks (~24 hours)
 */
export function useOracleFreshness() {
  const network = getNetwork();

  return useQuery({
    queryKey: ['oracle-freshness'],
    queryFn: async () => {
      try {
        const oracleData = await getOracleData(network);

        if (!oracleData) {
          return {
            isFresh: false,
            lastUpdateBlock: 0,
            blocksSinceUpdate: 999999,
            message: 'Could not fetch oracle data',
          };
        }

        const blocksSinceUpdate = oracleData.lastUpdateBlock === 0
          ? 999999
          : Date.now(); // Placeholder - need current block

        // Price is fresh if updated within last 144 blocks
        const isFresh = oracleData.isFresh && oracleData.lastUpdateBlock > 0;

        return {
          isFresh,
          lastUpdateBlock: oracleData.lastUpdateBlock,
          blocksSinceUpdate,
          price: oracleData.price,
          message: isFresh
            ? 'Oracle price is fresh'
            : oracleData.lastUpdateBlock === 0
              ? 'Oracle has never been updated - please update price first'
              : 'Oracle price is stale - please update',
        };
      } catch (error) {
        console.error('Error checking oracle freshness:', error);
        return {
          isFresh: false,
          lastUpdateBlock: 0,
          blocksSinceUpdate: 999999,
          message: 'Error checking oracle freshness',
        };
      }
    },
    // Refetch every 30 seconds
    refetchInterval: 30000,
    retry: 2,
  });
}

/**
 * Hook to get current oracle price
 */
export function useOraclePrice() {
  const network = getNetwork();

  return useQuery({
    queryKey: ['oracle-price'],
    queryFn: async () => {
      const oracleData = await getOracleData(network);
      return oracleData?.price || 0;
    },
    refetchInterval: 30000,
  });
}
