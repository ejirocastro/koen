'use client';

import { useState } from 'react';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
  const [filterAsset, setFilterAsset] = useState<'all' | 'sBTC' | 'kUSD'>('all');

  const offers = [
    { id: '#L001', lender: 'SP4F3...8KL2', amount: '5,000', asset: 'kUSD', rate: '5.8%', duration: '90 days', collateral: 'sBTC', ltv: '50%', status: 'active' },
    { id: '#L002', lender: 'SP9A1...3XYZ', amount: '10,000', asset: 'kUSD', rate: '6.2%', duration: '60 days', collateral: 'sBTC', ltv: '60%', status: 'active' },
    { id: '#L003', lender: 'SPBC7...4QWE', amount: '3,500', asset: 'kUSD', rate: '5.5%', duration: '120 days', collateral: 'sBTC', ltv: '45%', status: 'active' },
    { id: '#L004', lender: 'SP2D9...7RTY', amount: '8,000', asset: 'kUSD', rate: '6.5%', duration: '30 days', collateral: 'sBTC', ltv: '55%', status: 'active' },
    { id: '#L005', lender: 'SP1K8...9PLM', amount: '15,000', asset: 'kUSD', rate: '5.2%', duration: '180 days', collateral: 'sBTC', ltv: '50%', status: 'active' },
  ];

  const requests = [
    { id: '#B001', borrower: 'SP7H2...5NM3', amount: '2,500', asset: 'kUSD', maxRate: '6.0%', duration: '45 days', collateral: '0.15 sBTC', health: '175%', status: 'open' },
    { id: '#B002', borrower: 'SP3G9...1KL4', amount: '6,000', asset: 'kUSD', maxRate: '6.5%', duration: '90 days', collateral: '0.25 sBTC', health: '160%', status: 'open' },
    { id: '#B003', borrower: 'SP5D1...8XY2', amount: '4,200', asset: 'kUSD', maxRate: '5.8%', duration: '60 days', collateral: '0.18 sBTC', health: '180%', status: 'open' },
    { id: '#B004', borrower: 'SP9C4...2WQ7', amount: '9,500', asset: 'kUSD', maxRate: '7.0%', duration: '120 days', collateral: '0.35 sBTC', health: '155%', status: 'open' },
  ];

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
              Lending Offers ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                  : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
              }`}
            >
              Borrow Requests ({requests.length})
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

        {/* Lending Offers Table */}
        {activeTab === 'offers' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Offer ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Lender</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Duration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Max LTV</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, i) => (
                  <tr key={i} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{offer.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{offer.lender}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-white font-semibold tabular-nums">${offer.amount}</span>
                        <span className="text-xs text-[#848E9C]">{offer.asset}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-emerald-500 font-semibold tabular-nums">{offer.rate}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-white tabular-nums">{offer.duration}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-[#848E9C]">{offer.collateral}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-white tabular-nums">{offer.ltv}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded uppercase">
                        {offer.status}
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
          </div>
        )}

        {/* Borrow Requests Table */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Borrower</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Max APR</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Duration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Health</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, i) => (
                  <tr key={i} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{request.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{request.borrower}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-white font-semibold tabular-nums">${request.amount}</span>
                        <span className="text-xs text-[#848E9C]">{request.asset}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-orange-500 font-semibold tabular-nums">{request.maxRate}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-white tabular-nums">{request.duration}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-[#848E9C]">{request.collateral}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${
                        parseInt(request.health) >= 150 ? 'text-[#0ECB81]' : 'text-yellow-500'
                      }`}>
                        {request.health}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded uppercase">
                        {request.status}
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
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#2B3139] flex items-center justify-between">
          <span className="text-xs text-[#848E9C]">
            Showing {activeTab === 'offers' ? offers.length : requests.length} {activeTab === 'offers' ? 'offers' : 'requests'}
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-[#2B3139] hover:bg-[#343840] text-xs text-[#848E9C] hover:text-white rounded transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs rounded border border-emerald-500/30">
              1
            </button>
            <button className="px-3 py-1.5 bg-[#2B3139] hover:bg-[#343840] text-xs text-[#848E9C] hover:text-white rounded transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 bg-[#2B3139] hover:bg-[#343840] text-xs text-[#848E9C] hover:text-white rounded transition-colors">
              Next
            </button>
          </div>
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
          <div className="text-2xl font-bold text-white tabular-nums mb-1">47</div>
          <div className="text-xs text-[#0ECB81]">+5 this week</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Requests</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">32</div>
          <div className="text-xs text-orange-500">+3 this week</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Avg APR (Offers)</span>
            <svg className="w-4 h-4 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-emerald-500 tabular-nums mb-1">5.8%</div>
          <div className="text-xs text-[#848E9C]">Last 7 days</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Avg Collateral</span>
            <svg className="w-4 h-4 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">165%</div>
          <div className="text-xs text-[#0ECB81]">Healthy</div>
        </div>
      </div>
    </div>
  );
}
