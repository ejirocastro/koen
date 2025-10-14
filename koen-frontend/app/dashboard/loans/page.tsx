'use client';

import { useState } from 'react';
import { useWallet, useUserLoansWithHealth, useLoanHealth, useTokenBalances } from '@/lib/hooks';
import {
  microKusdToKusd,
  satoshisToSbtc,
  bpsToPercentage,
  blocksToDays,
} from '@/lib/utils/format-helpers';

export default function MyLoansPage() {
  const [activeTab, setActiveTab] = useState<'lender' | 'borrower'>('lender');

  // Get wallet connection
  const { address, isConnected, connectWallet } = useWallet();

  // Fetch user's loans
  const { loans, isLoading } = useUserLoansWithHealth(address);

  // Fetch token balances
  const { kusd, sbtc } = useTokenBalances(address);

  // Separate loans by role
  const lenderLoans = loans?.filter(loan => loan.lender === address) || [];
  const borrowerLoans = loans?.filter(loan => loan.borrower === address) || [];

  // Calculate portfolio stats
  const totalLent = lenderLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalBorrowed = borrowerLoans.reduce((sum, loan) => sum + loan.amount, 0);

  // Calculate interest earned (simplified - would need actual accrued interest)
  const interestEarned = 0; // TODO: Calculate from loan history

  // Calculate average health factor
  const avgHealth = loans && loans.length > 0
    ? loans.reduce((sum, loan) => sum + (loan.isAtRisk ? 100 : 150), 0) / loans.length
    : 165;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0B0E11] text-white p-4">
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Connect Wallet to View Your Loans</h2>
            <p className="text-sm text-[#848E9C] mb-6">
              Connect your Stacks wallet to see your active loans as lender and borrower
            </p>
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
    <div className="min-h-screen bg-[#0B0E11] text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">My Loans</h1>
        <p className="text-sm text-[#848E9C]">Manage your active loans as lender and borrower</p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Lent</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">
            ${microKusdToKusd(totalLent).toLocaleString()}
          </div>
          <div className="text-xs text-[#0ECB81]">{lenderLoans.length} active loans</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Borrowed</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">
            ${microKusdToKusd(totalBorrowed).toLocaleString()}
          </div>
          <div className="text-xs text-orange-500">{borrowerLoans.length} active loan{borrowerLoans.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Your kUSD Balance</span>
            <svg className="w-4 h-4 text-[#0ECB81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-[#0ECB81] tabular-nums mb-1">
            ${microKusdToKusd(kusd).toLocaleString()}
          </div>
          <div className="text-xs text-[#848E9C]">Available</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Your sBTC Balance</span>
            <svg className="w-4 h-4 text-[#0ECB81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-[#0ECB81] tabular-nums mb-1">
            {satoshisToSbtc(sbtc).toFixed(4)}
          </div>
          <div className="text-xs text-[#0ECB81]">sBTC</div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-sm text-[#848E9C]">Loading your loans...</p>
        </div>
      )}

      {/* Tabs & Table */}
      {!isLoading && (
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg">
          {/* Tabs Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('lender')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'lender'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
                }`}
              >
                As Lender ({lenderLoans.length})
              </button>
              <button
                onClick={() => setActiveTab('borrower')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'borrower'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                    : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
                }`}
              >
                As Borrower ({borrowerLoans.length})
              </button>
            </div>

            <button className="px-3 py-2 bg-[#2B3139] hover:bg-[#343840] text-sm text-[#848E9C] hover:text-white rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
          </div>

          {/* As Lender Table */}
          {activeTab === 'lender' && (
            <div className="overflow-x-auto">
              {lenderLoans.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2B3139]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Borrower</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Duration</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lenderLoans.map((loan) => (
                      <tr key={loan.loanId} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm text-white font-mono">#{loan.loanId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-white font-mono">{loan.borrower.substring(0, 10)}...</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-white font-semibold tabular-nums">
                            ${microKusdToKusd(loan.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-[#0ECB81] font-semibold tabular-nums">
                            {bpsToPercentage(loan.apr).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-white tabular-nums">
                            {blocksToDays(loan.endBlock - loan.startBlock)} days
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-[#848E9C]">
                            {satoshisToSbtc(loan.collateral).toFixed(4)} sBTC
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded uppercase ${
                            loan.status === 'active'
                              ? loan.isAtRisk
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-[#2B3139] text-[#848E9C]'
                          }`}>
                            {loan.status === 'active' ? (loan.isAtRisk ? 'At Risk' : 'Active') : 'Closed'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button className="px-3 py-1.5 bg-[#2B3139] hover:bg-[#343840] text-white text-xs font-semibold rounded transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-[#848E9C]">No active loans as lender</p>
                  <p className="text-xs text-[#848E9C] mt-2">Create a lending offer to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* As Borrower Table */}
          {activeTab === 'borrower' && (
            <div className="overflow-x-auto">
              {borrowerLoans.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2B3139]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Lender</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Duration</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowerLoans.map((loan) => (
                      <tr key={loan.loanId} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm text-white font-mono">#{loan.loanId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-white font-mono">{loan.lender.substring(0, 10)}...</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-white font-semibold tabular-nums">
                            ${microKusdToKusd(loan.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-orange-500 font-semibold tabular-nums">
                            {bpsToPercentage(loan.apr).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-[#848E9C]">
                            {satoshisToSbtc(loan.collateral).toFixed(4)} sBTC
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-white tabular-nums">
                            {blocksToDays(loan.endBlock - loan.startBlock)} days
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded uppercase ${
                            loan.status === 'active'
                              ? loan.isAtRisk
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-orange-500/10 text-orange-500'
                              : 'bg-[#2B3139] text-[#848E9C]'
                          }`}>
                            {loan.status === 'active' ? (loan.isAtRisk ? 'At Risk' : 'Active') : 'Closed'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {loan.status === 'active' ? (
                            <button className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-semibold rounded border border-orange-500/30 hover:border-orange-500/50 transition-all">
                              Repay
                            </button>
                          ) : (
                            <button className="px-3 py-1.5 bg-[#2B3139] text-[#848E9C] text-xs font-semibold rounded">
                              Closed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-[#848E9C]">No active loans as borrower</p>
                  <p className="text-xs text-[#848E9C] mt-2">Create a borrow request to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
