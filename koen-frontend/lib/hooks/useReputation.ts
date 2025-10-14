import { useQuery } from '@tanstack/react-query';
import {
  getReputation,
  getReputationScore,
  getReputationTier,
  getReputationMultiplier,
  getNextTierRequirement,
  type ReputationData
} from '../contracts/reputation-sbt';
import { getNetwork } from '../network';

/**
 * Hook to fetch user's complete reputation data
 */
export function useReputation(address: string | null) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['reputation', address],
    queryFn: async (): Promise<ReputationData | null> => {
      if (!address) return null;
      return await getReputation(address, network);
    },
    enabled: !!address,
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000,
  });
}

/**
 * Hook to fetch user's reputation score only
 */
export function useReputationScore(address: string | null) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['reputation-score', address],
    queryFn: async (): Promise<number> => {
      if (!address) return 0;
      return await getReputationScore(address, network);
    },
    enabled: !!address,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook to get next tier requirements with progress
 */
export function useNextTierRequirement(currentScore: number) {
  return {
    ...getNextTierRequirement(currentScore),
  };
}

/**
 * Hook to fetch reputation with next tier calculation
 */
export function useReputationWithProgress(address: string | null) {
  const reputationQuery = useReputation(address);

  const nextTier = reputationQuery.data
    ? getNextTierRequirement(reputationQuery.data.score)
    : null;

  return {
    ...reputationQuery,
    nextTier,
  };
}
