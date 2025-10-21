'use client';

import { useQuery } from '@tanstack/react-query';
import { getNetwork } from '../network';
import {
  getActiveLoan,
  getUserActiveLoans,
  getLoanHealthFactor,
  isLoanLiquidatable,
  getLoanCurrentDebt,
  type ActiveLoan,
} from '../contracts/p2p-marketplace';

/**
 * Hook to fetch all active loans for a user
 */
export function useUserLoans(address: string | null) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['user-loans', address],
    queryFn: async (): Promise<number[]> => {
      if (!address) return [];
      return await getUserActiveLoans(address, network);
    },
    enabled: !!address, // Only fetch if address is available
    staleTime: 120000, // Consider data fresh for 2 minutes
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Hook to fetch detailed information for multiple loans
 */
export function useLoanDetails(loanIds: number[]) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['loan-details', loanIds],
    queryFn: async (): Promise<ActiveLoan[]> => {
      if (!loanIds || loanIds.length === 0) return [];

      // Fetch all loans in parallel
      const promises = loanIds.map((id) => getActiveLoan(id, network));
      const results = await Promise.all(promises);

      // Filter out null results
      return results.filter((loan): loan is ActiveLoan => loan !== null);
    },
    enabled: loanIds && loanIds.length > 0,
    staleTime: 120000, // Consider data fresh for 2 minutes
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Hook to fetch a single loan's details
 */
export function useLoan(loanId: number) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => getActiveLoan(loanId, network),
    enabled: loanId > 0,
    staleTime: 120000, // Consider data fresh for 2 minutes
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Hook to fetch loan health factor
 */
export function useLoanHealth(loanId: number) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['loan-health', loanId],
    queryFn: async () => {
      const [healthFactor, isLiquidatable, currentDebt] = await Promise.all([
        getLoanHealthFactor(loanId, network),
        isLoanLiquidatable(loanId, network),
        getLoanCurrentDebt(loanId, network),
      ]);

      return {
        healthFactor,
        isLiquidatable,
        currentDebt,
      };
    },
    enabled: loanId > 0,
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 60000, // Refetch every 1 minute
  });
}

/**
 * Hook to fetch at-risk loans for a user
 * A loan is considered "at risk" if it's liquidatable (health factor below threshold)
 */
export function useAtRiskLoans(address: string | null) {
  const network = getNetwork();
  const { data: loanIds } = useUserLoans(address);

  return useQuery({
    queryKey: ['at-risk-loans', address, loanIds],
    queryFn: async (): Promise<number[]> => {
      if (!loanIds || loanIds.length === 0) return [];

      // Check each loan to see if it's liquidatable
      const liquidatableChecks = await Promise.all(
        loanIds.map(async (loanId) => {
          const liquidatable = await isLoanLiquidatable(loanId, network);
          return { loanId, liquidatable };
        })
      );

      // Filter to only liquidatable loans
      return liquidatableChecks
        .filter((check) => check.liquidatable)
        .map((check) => check.loanId);
    },
    enabled: !!address && !!loanIds && loanIds.length > 0,
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 60000, // Check every 1 minute (reduced from 10s)
  });
}

/**
 * Combined hook to get user's loans with health status
 */
export function useUserLoansWithHealth(address: string | null) {
  const { data: loanIds, ...loansQuery } = useUserLoans(address);
  const { data: loans, ...detailsQuery } = useLoanDetails(loanIds || []);
  const { data: atRiskIds, ...atRiskQuery } = useAtRiskLoans(address);

  // Combine health status into loans
  const loansWithHealth = loans?.map((loan) => ({
    ...loan,
    isAtRisk: atRiskIds?.includes(loan.loanId) || false,
  }));

  return {
    loans: loansWithHealth,
    loanIds,
    atRiskIds,
    isLoading: loansQuery.isLoading || detailsQuery.isLoading,
    error: loansQuery.error || detailsQuery.error || atRiskQuery.error,
  };
}

/**
 * Hook to fetch ALL liquidatable loans across the platform
 * This queries all loans (up to maxLoans) and checks which are liquidatable
 */
export function useAllLiquidatableLoans(maxLoans: number = 50) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['liquidatable-loans', maxLoans],
    queryFn: async () => {
      const liquidatableLoans: (ActiveLoan & { healthFactor: number; currentDebt: number; isLiquidatable: boolean })[] = [];

      // Query loans starting from ID 1 up to maxLoans
      // In production, you'd get the actual next-loan-id from the contract
      for (let loanId = 1; loanId <= maxLoans; loanId++) {
        const loan = await getActiveLoan(loanId, network);

        // Skip if loan doesn't exist or is not active
        if (!loan || loan.status !== 'active') continue;

        // Check if liquidatable
        const isLiquidatable = await isLoanLiquidatable(loanId, network);

        if (isLiquidatable) {
          // Get health factor and current debt
          const healthFactor = await getLoanHealthFactor(loanId, network);
          const currentDebt = await getLoanCurrentDebt(loanId, network);

          liquidatableLoans.push({
            ...loan,
            healthFactor: healthFactor || 0,
            currentDebt: currentDebt || 0,
            isLiquidatable: true,
          });
        }
      }

      return liquidatableLoans;
    },
    staleTime: 300000, // Consider data fresh for 5 minutes
    refetchInterval: 300000, // Refresh every 5 minutes (reduced from 30s)
    retry: 0, // No retries to avoid rate limiting
  });
}
