'use client';

import { useState } from 'react';
import { useActiveOffers, useActiveRequests, useMarketplaceStats } from '@/lib/hooks';
import {
  microKusdToKusd,
  satoshisToSbtc,
  bpsToPercentage,
  blocksToDays,
} from '@/lib/utils/format-helpers';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
  const [filterAsset, setFilterAsset] = useState<'all' | 'sBTC' | 'kUSD'>('all');

  // Fetch real data from blockchain
  const { data: offers, isLoading: offersLoading } = useActiveOffers(1, 50);
  const { data: requests, isLoading: requestsLoading } = useActiveRequests(1, 50);
  const { data: stats } = useMarketplaceStats();

  const isLoading = offersLoading || requestsLoading;

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
              Lending Offers ({offers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                  : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
              }`}
            >
              Borrow Requests ({requests?.length || 0})
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

            <button className="px-3 py-2 bg-[#2B3139] hover:bg-[#343840] text-sm text-[#848E9C] hover:text-white rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
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
            {offers && offers.length > 0 ? (
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
                  {offers.map((offer) => (
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
                            ${microKusdToKusd(offer.amount).toLocaleString()}
                          </span>
                          <span className="text-xs text-[#848E9C]">kUSD</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-emerald-500 font-semibold tabular-nums">
                          {bpsToPercentage(offer.apr).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-white tabular-nums">
                          {blocksToDays(offer.duration)} days
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
                        <button className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold rounded border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                          Borrow
                        </button>
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
            {requests && requests.length > 0 ? (
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
                  {requests.map((request) => (
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
                            ${microKusdToKusd(request.amount).toLocaleString()}
                          </span>
                          <span className="text-xs text-[#848E9C]">kUSD</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-orange-500 font-semibold tabular-nums">
                          {bpsToPercentage(request.maxApr).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-white tabular-nums">
                          {blocksToDays(request.duration)} days
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-[#848E9C]">
                          {satoshisToSbtc(request.collateralDeposited).toFixed(4)} sBTC
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded uppercase">
                          Open
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button className="px-4 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-semibold rounded border border-orange-500/30 hover:border-orange-500/50 transition-all">
                          Lend
                        </button>
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
            Showing {activeTab === 'offers' ? (offers?.length || 0) : (requests?.length || 0)}{' '}
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
            ${microKusdToKusd(stats?.totalVolumeLent || 0).toLocaleString()}
          </div>
          <div className="text-xs text-[#0ECB81]">Lent</div>
        </div>
      </div>
    </div>
  );
}
