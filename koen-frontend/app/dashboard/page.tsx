'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useUserLoansWithHealth, useTokenBalances, useMarketplaceStats, useReputationWithProgress } from '@/lib/hooks';
import { microKusdToKusd, satoshisToSbtc, bpsToPercentage, blocksToDays } from '@/lib/utils/format-helpers';

export default function DashboardPage() {
  const router = useRouter();
  const [loanFilter, setLoanFilter] = useState<'all' | 'lender' | 'borrower'>('all');

  // Get wallet connection
  const { address, isConnected, connectWallet } = useWallet();

  // Fetch user's data
  const { loans, isLoading: loansLoading } = useUserLoansWithHealth(address);
  const { kusd, sbtc, isLoading: balancesLoading } = useTokenBalances(address);
  const { data: stats, isLoading: statsLoading } = useMarketplaceStats();
  const { data: reputation, nextTier, isLoading: reputationLoading } = useReputationWithProgress(address);

  const isLoading = loansLoading || balancesLoading || statsLoading || reputationLoading;

  // Separate loans by role
  const lenderLoans = loans?.filter(loan => loan.lender === address) || [];
  const borrowerLoans = loans?.filter(loan => loan.borrower === address) || [];

  // Calculate portfolio stats
  const totalLent = lenderLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalBorrowed = borrowerLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalBalance = kusd + (sbtc * 100000); // Rough estimate (sBTC price in kUSD)

  // Calculate average APR for lender loans
  const avgLenderApr = lenderLoans.length > 0
    ? lenderLoans.reduce((sum, loan) => sum + loan.apr, 0) / lenderLoans.length
    : 0;

  // Calculate average APR for borrower loans
  const avgBorrowerApr = borrowerLoans.length > 0
    ? borrowerLoans.reduce((sum, loan) => sum + loan.apr, 0) / borrowerLoans.length
    : 0;

  // Filter loans for display
  const filteredLoans = loanFilter === 'all'
    ? loans || []
    : loanFilter === 'lender'
      ? lenderLoans
      : borrowerLoans;

  // Get reputation display
  const reputationTier = reputation?.tier || 'bronze';
  const reputationScore = reputation?.score || 0;
  const tierDisplay = reputationTier.toUpperCase();

  // Calculate available to borrow (simplified - based on reputation multiplier)
  const availableToBorrow = reputation ? microKusdToKusd(kusd) * (1 + (reputation.multiplier / 10000)) : 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0B0E11] text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-12">
            <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Connect Wallet to View Dashboard</h2>
            <p className="text-sm text-[#848E9C] mb-6">Connect your wallet to access your portfolio and market data</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-sm text-[#848E9C]">Loading dashboard data...</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-12 gap-4 p-4">
          {/* Portfolio Overview - Top Row */}
          <div className="col-span-12 grid grid-cols-4 gap-4">
            {/* Total Balance */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#848E9C]">Total Balance</span>
                <svg className="w-4 h-4 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-2xl font-semibold tabular-nums mb-1">${microKusdToKusd(totalBalance).toLocaleString()}</div>
              <div className="flex items-center gap-1">
                <span className="text-[#0ECB81] text-sm tabular-nums">${microKusdToKusd(kusd).toLocaleString()} kUSD</span>
                <span className="text-xs text-[#848E9C]">+ {satoshisToSbtc(sbtc).toFixed(4)} sBTC</span>
              </div>
            </div>

            {/* Total Lent */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#848E9C]">Total Lent</span>
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div className="text-2xl font-semibold tabular-nums mb-1">${microKusdToKusd(totalLent).toLocaleString()}</div>
              <div className="flex items-center gap-1">
                <span className="text-[#0ECB81] text-sm tabular-nums">APR {bpsToPercentage(avgLenderApr).toFixed(1)}%</span>
                <span className="text-xs text-[#848E9C]">{lenderLoans.length} loans</span>
              </div>
            </div>

            {/* Total Borrowed */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#848E9C]">Total Borrowed</span>
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div className="text-2xl font-semibold tabular-nums mb-1">${microKusdToKusd(totalBorrowed).toLocaleString()}</div>
              <div className="flex items-center gap-1">
                {borrowerLoans.length > 0 ? (
                  <>
                    <span className="text-orange-500 text-sm tabular-nums">APR {bpsToPercentage(avgBorrowerApr).toFixed(1)}%</span>
                    <span className="text-xs text-[#848E9C]">{borrowerLoans.length} loans</span>
                  </>
                ) : (
                  <span className="text-xs text-[#848E9C]">No active loans</span>
                )}
              </div>
            </div>

            {/* Available to Borrow */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#848E9C]">Available to Borrow</span>
                <div className={`px-1.5 py-0.5 text-xs rounded ${
                  reputationTier === 'gold' ? 'bg-yellow-500/10 text-yellow-500' :
                  reputationTier === 'silver' ? 'bg-gray-500/10 text-gray-400' :
                  'bg-orange-800/10 text-orange-700'
                }`}>{tierDisplay}</div>
              </div>
              <div className="text-2xl font-semibold tabular-nums mb-1">${availableToBorrow.toFixed(2)}</div>
              <div className="flex items-center gap-1">
                <span className="text-[#0ECB81] text-sm">Based on reputation</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Active Loans Table */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded">
              {/* Table Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
                <h2 className="text-sm font-semibold text-white">Active Loans</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLoanFilter('all')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      loanFilter === 'all'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#2B3139] hover:bg-[#343840] text-[#848E9C] hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLoanFilter('lender')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      loanFilter === 'lender'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#2B3139] hover:bg-[#343840] text-[#848E9C] hover:text-white'
                    }`}
                  >
                    Lender
                  </button>
                  <button
                    onClick={() => setLoanFilter('borrower')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      loanFilter === 'borrower'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#2B3139] hover:bg-[#343840] text-[#848E9C] hover:text-white'
                    }`}
                  >
                    Borrower
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {filteredLoans.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2B3139]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Duration</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Health</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((loan) => {
                        const isLender = loan.lender === address;
                        const healthRatio = loan.collateralRatio ? loan.collateralRatio : 150;

                        return (
                          <tr key={loan.loanId} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-mono">#{loan.loanId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                isLender
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-orange-500/10 text-orange-500'
                              }`}>
                                {isLender ? 'LENDER' : 'BORROWER'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-white tabular-nums">${microKusdToKusd(loan.amount).toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-sm tabular-nums ${
                                isLender ? 'text-[#0ECB81]' : 'text-orange-500'
                              }`}>
                                {bpsToPercentage(loan.apr).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="text-sm text-white">{blocksToDays(loan.duration)} days</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-sm tabular-nums ${
                                healthRatio >= 150 ? 'text-[#0ECB81]' :
                                healthRatio >= 120 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {healthRatio.toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                loan.isAtRisk
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-[#0ECB81]/10 text-[#0ECB81]'
                              }`}>
                                {loan.isAtRisk ? 'AT RISK' : 'HEALTHY'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-12 h-12 text-[#848E9C] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-[#848E9C]">No active loans found</p>
                    <p className="text-xs text-[#848E9C] mt-1">Start lending or borrowing to see your loans here</p>
                  </div>
                )}
              </div>

              {/* View All */}
              {filteredLoans.length > 0 && (
                <div className="p-3 border-t border-[#2B3139] text-center">
                  <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                    View All Loans →
                  </button>
                </div>
              )}
            </div>

            {/* Market Activity */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded">
              <div className="p-4 border-b border-[#2B3139]">
                <h2 className="text-sm font-semibold text-white">Recent Market Activity</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-[#848E9C] text-center py-8">
                  Market activity tracking coming in Phase 3
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Stats & Quick Actions */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Market Stats */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded">
              <div className="p-4 border-b border-[#2B3139]">
                <h2 className="text-sm font-semibold text-white">Market Stats</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">Total Volume (24h)</span>
                  <span className="text-sm text-white font-semibold tabular-nums">
                    ${stats ? microKusdToKusd(stats.totalVolume).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">Active Loans</span>
                  <span className="text-sm text-white font-semibold tabular-nums">
                    {stats?.totalLoans || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">Active Offers</span>
                  <span className="text-sm text-white font-semibold tabular-nums">
                    {stats?.activeOffers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">Active Requests</span>
                  <span className="text-sm text-white font-semibold tabular-nums">
                    {stats?.activeRequests || 0}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#2B3139]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#848E9C]">Liquidity Pool</span>
                    <span className="text-sm text-white font-semibold tabular-nums">
                      ${stats ? microKusdToKusd(stats.totalVolume).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1E2329] border border-[#2B3139] rounded">
              <div className="p-4 border-b border-[#2B3139]">
                <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push('/dashboard/create')}
                  className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded transition-colors group"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-xs text-emerald-500 font-semibold">Create Offer</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/create')}
                  className="p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded transition-colors group"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="text-xs text-orange-500 font-semibold">Borrow</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/marketplace')}
                  className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded transition-colors group"
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div className="text-xs text-blue-500 font-semibold">Browse Market</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/liquidation')}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded transition-colors group"
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-xs text-red-500 font-semibold">Liquidations</div>
                </button>
              </div>
            </div>

            {/* Reputation Status */}
            <div className={`bg-gradient-to-br rounded border ${
              reputationTier === 'gold'
                ? 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                : reputationTier === 'silver'
                  ? 'from-gray-500/10 to-gray-600/10 border-gray-500/30'
                  : 'from-orange-800/10 to-orange-900/10 border-orange-700/30'
            }`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">Reputation Status</h2>
                  <div className="text-2xl">
                    {reputationTier === 'gold' ? '🏆' : reputationTier === 'silver' ? '🥈' : '🥉'}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold ${
                        reputationTier === 'gold' ? 'text-yellow-500' :
                        reputationTier === 'silver' ? 'text-gray-400' :
                        'text-orange-700'
                      }`}>{tierDisplay} TIER</span>
                      <span className="text-xs text-[#848E9C]">
                        {nextTier?.nextTier ? `Next: ${nextTier.nextTier.toUpperCase()}` : 'Max Tier'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          reputationTier === 'gold'
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : reputationTier === 'silver'
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                              : 'bg-gradient-to-r from-orange-700 to-orange-800'
                        }`}
                        style={{ width: `${nextTier?.progress || 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#848E9C]">Credit Score</span>
                      <span className="text-white font-semibold">{reputationScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#848E9C]">Next Tier</span>
                      <span className={`font-semibold ${
                        reputationTier === 'gold' ? 'text-yellow-500' :
                        reputationTier === 'silver' ? 'text-gray-400' :
                        'text-orange-700'
                      }`}>
                        {nextTier?.requiredScore || reputationScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
