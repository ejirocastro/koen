/**
 * Debug endpoint to test offer fetching
 */

import { NextResponse } from 'next/server';
import { uintCV } from '@stacks/transactions';
import { CONTRACTS } from '@/lib/constants';
import { getNetwork } from '@/lib/network';
import { robustFetchReadOnly } from '@/lib/network/api-client';
import { getLendingOffer, getNextOfferIds } from '@/lib/contracts/p2p-marketplace';

export async function GET() {
  const network = getNetwork();
  const [contractAddress, contractName] = CONTRACTS.P2P_MARKETPLACE.split('.');

  const results: any = {
    contractAddress,
    contractName,
    tests: [],
  };

  try {
    // Test 1: Get next-offer-id
    results.tests.push({ name: 'Step 1: Get next-offer-id', status: 'running' });
    const nextIdData = await getNextOfferIds(network);

    if (!nextIdData) {
      results.tests[results.tests.length - 1].status = 'failed';
      results.tests[results.tests.length - 1].error = 'getNextOfferIds returned null';
      return NextResponse.json(results);
    }

    results.tests[results.tests.length - 1].status = 'success';
    results.tests[results.tests.length - 1].data = nextIdData;
    results.nextOfferId = nextIdData.nextId;

    // Test 2: Fetch individual offers
    const offerIds = [1, 2, 3];
    for (const offerId of offerIds) {
      results.tests.push({ name: `Step 2.${offerId}: Fetch offer #${offerId}`, status: 'running' });

      try {
        const offer = await getLendingOffer(offerId, network);

        if (!offer) {
          results.tests[results.tests.length - 1].status = 'not_found';
          results.tests[results.tests.length - 1].message = 'Offer does not exist or getLendingOffer returned null';
        } else {
          results.tests[results.tests.length - 1].status = 'success';
          results.tests[results.tests.length - 1].data = offer;
        }
      } catch (error: any) {
        results.tests[results.tests.length - 1].status = 'error';
        results.tests[results.tests.length - 1].error = error.message;
      }
    }

    // Test 3: Raw contract call to compare
    results.tests.push({ name: 'Step 3: Raw contract call for offer #1', status: 'running' });
    try {
      const rawData = await robustFetchReadOnly(
        contractAddress,
        contractName,
        'get-lending-offer',
        [uintCV(1)],
        network
      );

      results.tests[results.tests.length - 1].status = 'success';
      results.tests[results.tests.length - 1].data = rawData;
    } catch (error: any) {
      results.tests[results.tests.length - 1].status = 'error';
      results.tests[results.tests.length - 1].error = error.message;
    }

    // Summary
    results.summary = {
      totalTests: results.tests.length,
      passed: results.tests.filter((t: any) => t.status === 'success').length,
      failed: results.tests.filter((t: any) => t.status === 'failed' || t.status === 'error').length,
      notFound: results.tests.filter((t: any) => t.status === 'not_found').length,
    };

  } catch (error: any) {
    results.error = error.message;
    results.stack = error.stack;
  }

  return NextResponse.json(results, { status: 200 });
}
