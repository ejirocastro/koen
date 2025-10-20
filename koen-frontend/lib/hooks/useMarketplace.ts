'use client';

import { useQuery } from '@tanstack/react-query';
import { getNetwork } from '../network';
import {
  getLendingOffer,
  getBorrowRequest,
  getMarketplaceStats,
  getNextOfferIds,
  getNextRequestIds,
  type LendingOffer,
  type BorrowRequest,
  type MarketplaceStats,
} from '../contracts/p2p-marketplace';

/**
 * Hook to fetch all active lending offers
 * Uses smart querying: fetches the next-offer-id from contract, then queries backwards
 */
export function useActiveOffers(maxCount: number = 50) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['active-offers', maxCount],
    queryFn: async (): Promise<LendingOffer[]> => {
      const offers: LendingOffer[] = [];

      try {
        // First, get the next offer ID to know the range
        const nextIdData = await getNextOfferIds(network);
        if (!nextIdData || nextIdData.nextId <= 1) {
          // No offers created yet
          return [];
        }

        const nextOfferId = nextIdData.nextId;
        const startId = Math.max(1, nextOfferId - maxCount);
        const endId = nextOfferId - 1; // next-offer-id is the NEXT one to be created

        console.log(`[useActiveOffers] Next offer ID: ${nextOfferId}, fetching offers from ${startId} to ${endId}`);

        // Fetch offers in smaller batches to avoid rate limiting
        const BATCH_SIZE = 5;
        const totalOffers = endId - startId + 1;
        const batches = Math.ceil(totalOffers / BATCH_SIZE);

        for (let batch = 0; batch < batches; batch++) {
          const batchStart = startId + (batch * BATCH_SIZE);
          const batchCount = Math.min(BATCH_SIZE, totalOffers - (batch * BATCH_SIZE));

          const promises = Array.from({ length: batchCount }, (_, i) => {
            const offerId = batchStart + i;
            return getLendingOffer(offerId, network);
          });

          const results = await Promise.all(promises);

          // Filter out null results and inactive offers
          for (const offer of results) {
            console.log(`[useActiveOffers] Offer fetched:`, offer);
            if (offer && offer.status === 'open') {
              offers.push(offer);
              console.log(`[useActiveOffers] ✓ Added offer #${offer.offerId} (status: ${offer.status})`);
            } else if (offer) {
              console.log(`[useActiveOffers] ✗ Skipped offer (status: ${offer.status})`);
            } else {
              console.log(`[useActiveOffers] ✗ Null offer`);
            }
          }

          // Small delay between batches to be nice to the API
          if (batch < batches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }

      return offers;
    },
    // Refetch every 15 seconds for better UX (offers appear faster)
    refetchInterval: 15000,
    retry: 1, // Only retry once
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
}

/**
 * Hook to fetch all active borrow requests
 * Uses smart querying: fetches the next-request-id from contract, then queries backwards
 */
export function useActiveRequests(maxCount: number = 50) {
  const network = getNetwork();

  return useQuery({
    queryKey: ['active-requests', maxCount],
    queryFn: async (): Promise<BorrowRequest[]> => {
      const requests: BorrowRequest[] = [];

      try {
        // First, get the next request ID to know the range
        const nextIdData = await getNextRequestIds(network);
        if (!nextIdData || nextIdData.nextId <= 1) {
          // No requests created yet
          return [];
        }

        const nextRequestId = nextIdData.nextId;
        const startId = Math.max(1, nextRequestId - maxCount);
        const endId = nextRequestId - 1;

        console.log(`[useActiveRequests] Fetching requests from ${startId} to ${endId}`);

        // Fetch requests in smaller batches to avoid rate limiting
        const BATCH_SIZE = 5;
        const totalRequests = endId - startId + 1;
        const batches = Math.ceil(totalRequests / BATCH_SIZE);

        for (let batch = 0; batch < batches; batch++) {
          const batchStart = startId + (batch * BATCH_SIZE);
          const batchCount = Math.min(BATCH_SIZE, totalRequests - (batch * BATCH_SIZE));

          const promises = Array.from({ length: batchCount }, (_, i) => {
            const requestId = batchStart + i;
            return getBorrowRequest(requestId, network);
          });

          const results = await Promise.all(promises);

          // Filter out null results and inactive requests
          for (const request of results) {
            if (request && request.status === 'open') {
              requests.push(request);
            }
          }

          // Small delay between batches to be nice to the API
          if (batch < batches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }

      return requests;
    },
    // Refetch every 15 seconds for better UX (requests appear faster)
    refetchInterval: 15000,
    retry: 1, // Only retry once
    staleTime: 10000, // Consider data fresh for 10 seconds
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
    refetchInterval: 120000, // Refetch every 2 minutes
    retry: 2, // Retry twice before giving up
    retryDelay: 2000, // Wait 2s between retries
    staleTime: 60000, // Consider data fresh for 1 minute
  });
}
