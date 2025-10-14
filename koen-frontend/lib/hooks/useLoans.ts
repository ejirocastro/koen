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
    refetchInterval: 30000, // Refetch every 30 seconds
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
    refetchInterval: 30000,
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
    refetchInterval: 30000,
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
    refetchInterval: 10000, // Refetch every 10 seconds (critical data)
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
    refetchInterval: 10000, // Check frequently for at-risk loans
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
