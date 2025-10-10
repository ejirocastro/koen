'use client';

import { useState } from 'react';

export default function MyLoansPage() {
  const [activeTab, setActiveTab] = useState<'lender' | 'borrower'>('lender');

  const lenderLoans = [
    { id: '#1234', borrower: 'SP3D6P...ABC', amount: '2,000', apr: '5.5%', startDate: 'Oct 10, 2025', dueDate: 'Dec 25, 2025', daysLeft: 45, health: '150%', progress: 35, status: 'active' },
    { id: '#9012', borrower: 'SP8KL1...XYZ', amount: '3,250', apr: '6.2%', startDate: 'Oct 20, 2025', dueDate: 'Nov 30, 2025', daysLeft: 20, health: '125%', progress: 68, status: 'active' },
    { id: '#5432', borrower: 'SP2GH9...MNO', amount: '1,500', apr: '5.8%', startDate: 'Sep 15, 2025', dueDate: 'Dec 15, 2025', daysLeft: 35, health: '180%', progress: 22, status: 'active' },
  ];

  const borrowerLoans = [
    { id: '#5678', lender: 'SP1A2B...XYZ', amount: '1,000', apr: '4.9%', startDate: 'Sep 5, 2025', dueDate: 'Jan 15, 2026', daysLeft: 75, health: '180%', progress: 20, status: 'active', collateral: '0.15 sBTC' },
  ];

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
          <div className="text-2xl font-bold text-white tabular-nums mb-1">$6,750</div>
          <div className="text-xs text-[#0ECB81]">3 active loans</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Borrowed</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mb-1">$1,000</div>
          <div className="text-xs text-orange-500">1 active loan</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Interest Earned</span>
            <svg className="w-4 h-4 text-[#0ECB81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-[#0ECB81] tabular-nums mb-1">$145.50</div>
          <div className="text-xs text-[#848E9C]">This month</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Avg Health Factor</span>
            <svg className="w-4 h-4 text-[#0ECB81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-[#0ECB81] tabular-nums mb-1">165%</div>
          <div className="text-xs text-[#0ECB81]">Healthy</div>
        </div>
      </div>

      {/* Tabs & Table */}
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Borrower</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Due Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Health</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Progress</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                </tr>
              </thead>
              <tbody>
                {lenderLoans.map((loan, i) => (
                  <tr key={i} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{loan.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{loan.borrower}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-white font-semibold tabular-nums">${loan.amount}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-[#0ECB81] font-semibold tabular-nums">{loan.apr}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm text-white">{loan.dueDate}</div>
                      <div className="text-xs text-[#848E9C]">{loan.daysLeft} days left</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${
                        parseInt(loan.health) >= 150 ? 'text-[#0ECB81]' :
                        parseInt(loan.health) >= 120 ? 'text-yellow-500' : 'text-[#F6465D]'
                      }`}>
                        {loan.health}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${loan.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-[#848E9C] tabular-nums">{loan.progress}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded uppercase">
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="px-3 py-1.5 bg-[#2B3139] hover:bg-[#343840] text-white text-xs font-semibold rounded transition-colors">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* As Borrower Table */}
        {activeTab === 'borrower' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Lender</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Due Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Health</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Progress</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowerLoans.map((loan, i) => (
                  <tr key={i} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{loan.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-white font-mono">{loan.lender}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-white font-semibold tabular-nums">${loan.amount}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-orange-500 font-semibold tabular-nums">{loan.apr}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-[#848E9C]">{loan.collateral}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm text-white">{loan.dueDate}</div>
                      <div className="text-xs text-[#848E9C]">{loan.daysLeft} days left</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-[#0ECB81] font-semibold tabular-nums">{loan.health}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${loan.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-[#848E9C] tabular-nums">{loan.progress}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-semibold rounded border border-orange-500/30 hover:border-orange-500/50 transition-all">
                        Repay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
