'use client';

import { useQuery } from '@tanstack/react-query';
import { getNetwork } from '../network';
import {
  getLendingOffer,
  getBorrowRequest,
  getMarketplaceStats,
  type LendingOffer,
  type BorrowRequest,
  type MarketplaceStats,
} from '../contracts/p2p-marketplace';

/**
 * Hook to fetch all active lending offers
 * Note: This fetches a range of offer IDs. In production, you'd want pagination.
 */
export function useActiveOffers(startId: number = 1, count: number = 20) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['active-offers', startId, count],
    queryFn: async (): Promise<LendingOffer[]> => {
      const offers: LendingOffer[] = [];

      try {
        // Fetch offers in parallel
        const promises = Array.from({ length: count }, (_, i) => {
          const offerId = startId + i;
          return getLendingOffer(offerId, network);
        });

        const results = await Promise.all(promises);

        // Filter out null results and inactive offers
        for (const offer of results) {
          if (offer && offer.status === 'open') {
            offers.push(offer);
          }
        }
      } catch (error) {
        // Silently handle errors - empty marketplace is normal
        console.log('No offers found or marketplace is empty');
      }

      return offers;
    },
    // Refetch every 30 seconds
    refetchInterval: 30000,
    retry: 1, // Only retry once
  });
}

/**
 * Hook to fetch all active borrow requests
 */
export function useActiveRequests(startId: number = 1, count: number = 20) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['active-requests', startId, count],
    queryFn: async (): Promise<BorrowRequest[]> => {
      const requests: BorrowRequest[] = [];

      try {
        // Fetch requests in parallel
        const promises = Array.from({ length: count }, (_, i) => {
          const requestId = startId + i;
          return getBorrowRequest(requestId, network);
        });

        const results = await Promise.all(promises);

        // Filter out null results and inactive requests
        for (const request of results) {
          if (request && request.status === 'open') {
            requests.push(request);
          }
        }
      } catch (error) {
        // Silently handle errors - empty marketplace is normal
        console.log('No requests found or marketplace is empty');
      }

      return requests;
    },
    refetchInterval: 30000,
    retry: 1, // Only retry once
  });
}

/**
 * Hook to fetch a single lending offer
 */
export function useLendingOffer(offerId: number) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['lending-offer', offerId],
    queryFn: () => getLendingOffer(offerId, network),
    enabled: offerId > 0, // Only fetch if valid ID
  });
}

/**
 * Hook to fetch a single borrow request
 */
export function useBorrowRequest(requestId: number) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['borrow-request', requestId],
    queryFn: () => getBorrowRequest(requestId, network),
    enabled: requestId > 0,
  });
}

/**
 * Hook to fetch marketplace statistics
 * This also counts active offers and requests
 */
export function useMarketplaceStats() {
  const network = getNetwork();

  return useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: async () => {
      try {
        const stats = await getMarketplaceStats(network);
        return stats;
      } catch (error) {
        console.warn('Failed to fetch marketplace stats, using defaults:', error);
        // Return default values if API is down
        return {
          totalOffersCreated: 0,
          totalRequestsCreated: 0,
          totalLoansCreated: 0,
          totalVolumeLent: 0,
          totalInterestEarned: 0,
          totalVolume: 0,
          totalLoans: 0,
          activeOffers: 0,
          activeRequests: 0,
        };
      }
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 2, // Retry twice before giving up
    retryDelay: 1000, // Wait 1s between retries
  });
}
