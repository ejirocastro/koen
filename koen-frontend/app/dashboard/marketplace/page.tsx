'use client';

import { useState } from 'react';
import { useActiveOffers, useActiveRequests, useMarketplaceStats, useWallet } from '@/lib/hooks';
import { matchOfferToRequest, cancelLendingOffer, cancelBorrowRequest } from '@/lib/contracts/p2p-marketplace';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
  const [filterAsset, setFilterAsset] = useState<'all' | 'sBTC' | 'kUSD'>('all');
  const [matchingOfferId, setMatchingOfferId] = useState<number | null>(null);
  const [matchingRequestId, setMatchingRequestId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Fetch real data from blockchain
  const { data: offers, isLoading: offersLoading, refetch: refetchOffers } = useActiveOffers(50);
  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useActiveRequests(50);
  const { data: stats } = useMarketplaceStats();
  const { address, isConnected } = useWallet();

  const isLoading = offersLoading || requestsLoading;

  // Handler for matching offer to request
  const handleMatchOffer = async (offerId: number, requestId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setMatchingOfferId(offerId);
    setMatchingRequestId(requestId);
    const toastId = toast.loading('Matching offer to request...');

    try {
      const result = await matchOfferToRequest(offerId, requestId);

      toast.success(
        <div>
          <div>Loan created successfully!</div>
          <a
            href={`https://explorer.hiro.so/txid/${result.txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 block"
          >
            View on Explorer
          </a>
          <div className="text-xs mt-1">Your loan will be active after confirmation (~10 min)</div>
        </div>,
        { id: toastId, duration: 8000 }
      );

      // Refetch data after successful match
      setTimeout(() => {
        refetchOffers();
        refetchRequests();
      }, 2000);
    } catch (error: any) {
      console.error('Error matching offer to request:', error);
      toast.error(error.message || 'Failed to match offer. Please try again.', { id: toastId });
    } finally {
      setMatchingOfferId(null);
      setMatchingRequestId(null);
    }
  };

  // Handler for cancelling lending offer
  const handleCancelOffer = async (offerId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setCancellingId(offerId);
    const toastId = toast.loading('Cancelling offer...');

    try {
      const result = await cancelLendingOffer(offerId);

      toast.success(
        <div>
          <div>Offer cancelled successfully!</div>
          <a
            href={`https://explorer.hiro.so/txid/${result.txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 block"
          >
            View on Explorer
          </a>
        </div>,
        { id: toastId, duration: 6000 }
      );

      // Refetch offers after cancellation
      setTimeout(() => {
        refetchOffers();
      }, 2000);
    } catch (error: any) {
      console.error('Error cancelling offer:', error);
      toast.error(error.message || 'Failed to cancel offer. Please try again.', { id: toastId });
    } finally {
      setCancellingId(null);
    }
  };

  // Handler for cancelling borrow request
  const handleCancelRequest = async (requestId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setCancellingId(requestId);
    const toastId = toast.loading('Cancelling request...');

    try {
      const result = await cancelBorrowRequest(requestId);

      toast.success(
        <div>
          <div>Request cancelled successfully!</div>
          <a
            href={`https://explorer.hiro.so/txid/${result.txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 block"
          >
            View on Explorer
          </a>
        </div>,
        { id: toastId, duration: 6000 }
      );

      // Refetch requests after cancellation
      setTimeout(() => {
        refetchRequests();
      }, 2000);
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast.error(error.message || 'Failed to cancel request. Please try again.', { id: toastId });
    } finally {
      setCancellingId(null);
    }
  };

  // Filter offers/requests based on selected asset
  const filteredOffers = offers?.filter(offer => {
    if (filterAsset === 'all') return true;
    // All offers are in kUSD for now
    return filterAsset === 'kUSD';
  });

  const filteredRequests = requests?.filter(request => {
    if (filterAsset === 'all') return true;
    // All requests borrow kUSD and deposit sBTC
    return filterAsset === 'kUSD' || filterAsset === 'sBTC';
  });

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Lending Marketplace</h1>
        <p className="text-sm text-[#848E9C]">Browse available lending offers and borrowing requests</p>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg mb-4">
        <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'offers'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
              }`}
            >
              Lending Offers ({filteredOffers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                  : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
              }`}
            >
              Borrow Requests ({filteredRequests?.length || 0})
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value as any)}
              className="px-3 py-2 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] rounded-lg text-sm text-white transition-colors focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Assets</option>
              <option value="kUSD">kUSD</option>
              <option value="sBTC">sBTC</option>
            </select>

            <button
              onClick={() => {
                refetchOffers();
                refetchRequests();
                toast.success('Refreshing marketplace data...', { duration: 2000 });
              }}
              className="px-3 py-2 bg-[#2B3139] hover:bg-[#343840] text-sm text-[#848E9C] hover:text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-sm text-[#848E9C]">Loading marketplace data...</p>
          </div>
        )}

        {/* Lending Offers Table */}
        {activeTab === 'offers' && !isLoading && (
          <div className="overflow-x-auto">
            {filteredOffers && filteredOffers.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2B3139]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Offer ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Lender</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Min APR</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Max Duration</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Min Collateral</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Max LTV</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => (
                    <tr key={offer.offerId} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="text-sm text-white font-mono">#{offer.offerId}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-white font-mono">{offer.lender.substring(0, 8)}...</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-white font-semibold tabular-nums">
                            ${offer.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#848E9C]">kUSD</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-emerald-500 font-semibold tabular-nums">
                          {offer.apr.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-white tabular-nums">
                          {Math.round(offer.duration / 144)} days
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-[#848E9C]">
                          {offer.collateralRatio}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-white tabular-nums">
                          {(100 / offer.collateralRatio * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded uppercase">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {address === offer.lender ? (
                            <button
                              onClick={() => handleCancelOffer(offer.offerId)}
                              disabled={cancellingId === offer.offerId}
                              className={`px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded border border-red-500/30 hover:border-red-500/50 transition-all ${
                                cancellingId === offer.offerId ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {cancellingId === offer.offerId ? 'Cancelling...' : 'Cancel'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                // For now, show a message to create a matching request
                                toast.error('Please create a borrow request first, then match from the Requests tab');
                              }}
                              className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold rounded border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                            >
                              Match
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-[#848E9C]">No active lending offers found</p>
                <p className="text-xs text-[#848E9C] mt-2">Create the first offer to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Borrow Requests Table */}
        {activeTab === 'requests' && !isLoading && (
          <div className="overflow-x-auto">
            {filteredRequests && filteredRequests.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2B3139]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Request ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Borrower</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Max APR</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Duration</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.requestId} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="text-sm text-white font-mono">#{request.requestId}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-white font-mono">{request.borrower.substring(0, 8)}...</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-white font-semibold tabular-nums">
                            ${request.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#848E9C]">kUSD</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-orange-500 font-semibold tabular-nums">
                          {request.maxApr.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-white tabular-nums">
                          {Math.round(request.duration / 144)} days
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-[#848E9C]">
                          {request.collateralDeposited.toFixed(4)} sBTC
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded uppercase">
                          Open
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {address === request.borrower ? (
                            <button
                              onClick={() => handleCancelRequest(request.requestId)}
                              disabled={cancellingId === request.requestId}
                              className={`px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded border border-red-500/30 hover:border-red-500/50 transition-all ${
                                cancellingId === request.requestId ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {cancellingId === request.requestId ? 'Cancelling...' : 'Cancel'}
                            </button>
                          ) : offers && offers.length > 0 ? (
                            <select
                              onChange={(e) => {
                                const offerId = parseInt(e.target.value);
                                if (offerId > 0) {
                                  handleMatchOffer(offerId, request.requestId);
                                  e.target.value = ''; // Reset select
                                }
                              }}
                              disabled={matchingRequestId === request.requestId}
                              className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-semibold rounded border border-orange-500/30 hover:border-orange-500/50 transition-all focus:outline-none"
                            >
                              <option value="">Match with Offer</option>
                              {offers.filter(o => o.status === 'open').map(offer => (
                                <option key={offer.offerId} value={offer.offerId}>
                                  Offer #{offer.offerId} - ${offer.amount.toLocaleString()} @ {offer.apr.toFixed(1)}%
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              disabled
                              className="px-4 py-1.5 bg-gray-500/10 text-gray-500 text-xs font-semibold rounded border border-gray-500/30 cursor-not-allowed"
                            >
                              No Offers
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-[#848E9C]">No active borrow requests found</p>
                <p className="text-xs text-[#848E9C] mt-2">Create the first request to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#2B3139] flex items-center justify-between">
          <span className="text-xs text-[#848E9C]">
            Showing {activeTab === 'offers' ? (filteredOffers?.length || 0) : (filteredRequests?.length || 0)}{' '}
            {activeTab === 'offers' ? 'offers' : 'requests'}
          </span>
        </div>
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Offers</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">
            {stats?.totalOffersCreated || 0}
          </div>
          <div className="text-xs text-[#0ECB81]">On chain</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Requests</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">
            {stats?.totalRequestsCreated || 0}
          </div>
          <div className="text-xs text-orange-500">On chain</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Loans</span>
            <svg className="w-4 h-4 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-emerald-500 tabular-nums mb-1">
            {stats?.totalLoansCreated || 0}
          </div>
          <div className="text-xs text-[#848E9C]">Created</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Volume</span>
            <svg className="w-4 h-4 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">
            ${(stats?.totalVolumeLent || 0).toLocaleString()}
          </div>
          <div className="text-xs text-[#0ECB81]">Lent</div>
        </div>
      </div>
    </div>
  );
}
