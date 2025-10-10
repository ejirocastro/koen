export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      {/* Main Grid Layout */}
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
            <div className="text-2xl font-semibold tabular-nums mb-1">$15,750.00</div>
            <div className="flex items-center gap-1">
              <span className="text-[#0ECB81] text-sm tabular-nums">+$450.00</span>
              <span className="text-xs text-[#848E9C]">(+2.94%)</span>
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
            <div className="text-2xl font-semibold tabular-nums mb-1">$5,250.00</div>
            <div className="flex items-center gap-1">
              <span className="text-[#0ECB81] text-sm tabular-nums">APR 5.5%</span>
              <span className="text-xs text-[#848E9C]">3 loans</span>
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
            <div className="text-2xl font-semibold tabular-nums mb-1">$1,000.00</div>
            <div className="flex items-center gap-1">
              <span className="text-orange-500 text-sm tabular-nums">APR 4.9%</span>
              <span className="text-xs text-[#848E9C]">1 loan</span>
            </div>
          </div>

          {/* Available to Borrow */}
          <div className="bg-[#1E2329] border border-[#2B3139] rounded p-4 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#848E9C]">Available to Borrow</span>
              <div className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded">GOLD</div>
            </div>
            <div className="text-2xl font-semibold tabular-nums mb-1">$8,500.00</div>
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
                <button className="px-3 py-1 bg-[#2B3139] hover:bg-[#343840] text-xs text-[#848E9C] hover:text-white rounded transition-colors">
                  All
                </button>
                <button className="px-3 py-1 bg-[#2B3139] hover:bg-[#343840] text-xs text-[#848E9C] hover:text-white rounded transition-colors">
                  Lender
                </button>
                <button className="px-3 py-1 bg-[#2B3139] hover:bg-[#343840] text-xs text-[#848E9C] hover:text-white rounded transition-colors">
                  Borrower
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2B3139]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">APR</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Due Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Health</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loan Row 1 */}
                  <tr className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-mono">#1234</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs rounded">LENDER</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-white tabular-nums">$2,000.00</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[#0ECB81] tabular-nums">5.5%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm text-white">Dec 25, 2025</div>
                      <div className="text-xs text-[#848E9C]">45 days left</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[#0ECB81] tabular-nums">150%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-xs text-[#848E9C] tabular-nums">35%</span>
                      </div>
                    </td>
                  </tr>

                  {/* Loan Row 2 */}
                  <tr className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-mono">#5678</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded">BORROWER</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-white tabular-nums">$1,000.00</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-orange-500 tabular-nums">4.9%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm text-white">Jan 15, 2026</div>
                      <div className="text-xs text-[#848E9C]">75 days left</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[#0ECB81] tabular-nums">180%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                        <span className="text-xs text-[#848E9C] tabular-nums">20%</span>
                      </div>
                    </td>
                  </tr>

                  {/* Loan Row 3 */}
                  <tr className="hover:bg-[#2B3139]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-mono">#9012</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs rounded">LENDER</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-white tabular-nums">$3,250.00</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[#0ECB81] tabular-nums">6.2%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm text-white">Nov 30, 2025</div>
                      <div className="text-xs text-[#848E9C]">20 days left</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-yellow-500 tabular-nums">125%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                        <span className="text-xs text-[#848E9C] tabular-nums">68%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* View All */}
            <div className="p-3 border-t border-[#2B3139] text-center">
              <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                View All Loans →
              </button>
            </div>
          </div>

          {/* Market Activity */}
          <div className="bg-[#1E2329] border border-[#2B3139] rounded">
            <div className="p-4 border-b border-[#2B3139]">
              <h2 className="text-sm font-semibold text-white">Recent Market Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { action: 'New Offer', user: 'SP4F3...8KL2', amount: '$5,000', apr: '5.8%', time: '2m ago' },
                { action: 'Loan Funded', user: 'SP9A1...3XYZ', amount: '$2,500', apr: '4.5%', time: '8m ago' },
                { action: 'Repayment', user: 'SPBC7...4QWE', amount: '$1,200', apr: '6.1%', time: '15m ago' },
                { action: 'New Request', user: 'SP2D9...7RTY', amount: '$3,800', apr: '5.2%', time: '23m ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2B3139] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      activity.action === 'New Offer' ? 'bg-emerald-500' :
                      activity.action === 'Loan Funded' ? 'bg-blue-500' :
                      activity.action === 'Repayment' ? 'bg-[#0ECB81]' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <div className="text-sm text-white">{activity.action}</div>
                      <div className="text-xs text-[#848E9C] font-mono">{activity.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white tabular-nums">{activity.amount}</div>
                    <div className="text-xs text-[#848E9C]">{activity.apr} • {activity.time}</div>
                  </div>
                </div>
              ))}
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
                <span className="text-sm text-white font-semibold tabular-nums">$2.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#848E9C]">Active Loans</span>
                <span className="text-sm text-white font-semibold tabular-nums">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#848E9C]">Avg APR (Lending)</span>
                <span className="text-sm text-[#0ECB81] font-semibold tabular-nums">5.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#848E9C]">Avg APR (Borrowing)</span>
                <span className="text-sm text-orange-500 font-semibold tabular-nums">4.9%</span>
              </div>
              <div className="pt-3 border-t border-[#2B3139]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#848E9C]">Liquidity Pool</span>
                  <span className="text-sm text-white font-semibold tabular-nums">$8.2M</span>
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
              <button className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded transition-colors group">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-xs text-emerald-500 font-semibold">Create Offer</div>
              </button>
              <button className="p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded transition-colors group">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-xs text-orange-500 font-semibold">Borrow</div>
              </button>
              <button className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded transition-colors group">
                <div className="text-2xl mb-2">💼</div>
                <div className="text-xs text-blue-500 font-semibold">Browse Market</div>
              </button>
              <button className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded transition-colors group">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-xs text-red-500 font-semibold">Liquidations</div>
              </button>
            </div>
          </div>

          {/* Reputation Status */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Reputation Status</h2>
                <div className="text-2xl">🏆</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-yellow-500 font-semibold">GOLD TIER</span>
                    <span className="text-xs text-[#848E9C]">Level 3/5</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#848E9C]">Credit Score</span>
                    <span className="text-white font-semibold">750</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#848E9C]">Next Tier</span>
                    <span className="text-yellow-500 font-semibold">850</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
