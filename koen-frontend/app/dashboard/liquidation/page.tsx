'use client';

import { useState } from 'react';
import { useAllLiquidatableLoans } from '@/lib/hooks';
import { liquidateLoan } from '@/lib/contracts/p2p-marketplace';
import { satoshisToSbtc } from '@/lib/utils/format-helpers';
import toast from 'react-hot-toast';

interface LiquidationLoan {
  loanId: string;
  borrower: string;
  collateralAmount: number;
  collateralValue: number;
  debtAmount: number;
  healthFactor: number;
  ltv: number;
  liquidationPrice: number;
  timeToLiquidation: string;
  riskLevel: 'critical' | 'high' | 'medium';
}

export default function LiquidationPage() {
  const [sortBy, setSortBy] = useState<'healthFactor' | 'debtAmount' | 'timeToLiquidation'>('healthFactor');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [liquidatingId, setLiquidatingId] = useState<number | null>(null);

  // Fetch real liquidatable loans from blockchain
  const { data: blockchainLoans, isLoading, refetch } = useAllLiquidatableLoans(20);

  // Transform blockchain data to match UI format
  const liquidationLoans: LiquidationLoan[] = blockchainLoans?.map(loan => {
    const getRiskLevel = (hf: number): 'critical' | 'high' | 'medium' => {
      if (hf < 105) return 'critical';
      if (hf < 108) return 'high';
      return 'medium';
    };

    const getTimeToLiquidation = (hf: number): string => {
      if (hf < 105) return '< 1 hour';
      if (hf < 107) return '2-4 hours';
      if (hf < 110) return '4-8 hours';
      if (hf < 115) return '12-24 hours';
      if (hf < 118) return '1-2 days';
      return '2-3 days';
    };

    const sbtcAmount = loan.collateral; // Already in sBTC format
    const sbtcPrice = 96420; // TODO: Get from oracle
    const collateralValue = sbtcAmount * sbtcPrice;

    return {
      loanId: `L-${String(loan.loanId).padStart(5, '0')}`,
      borrower: `${loan.borrower.substring(0, 6)}...${loan.borrower.substring(loan.borrower.length - 4)}`,
      collateralAmount: sbtcAmount,
      collateralValue: collateralValue,
      debtAmount: loan.currentDebt,
      healthFactor: loan.healthFactor,
      ltv: (loan.currentDebt / collateralValue) * 100,
      liquidationPrice: (loan.currentDebt / sbtcAmount),
      timeToLiquidation: getTimeToLiquidation(loan.healthFactor),
      riskLevel: getRiskLevel(loan.healthFactor),
    };
  }) || [];

  // Mock data for demo purposes (remove when blockchain has data)
  const mockLoans: LiquidationLoan[] = liquidationLoans.length === 0 ? [
    {
      loanId: 'L-00042',
      borrower: 'SP2J6Z...4XYZ',
      collateralAmount: 0.15,
      collateralValue: 14463,
      debtAmount: 13850,
      healthFactor: 104.4,
      ltv: 95.8,
      liquidationPrice: 92308,
      timeToLiquidation: '< 1 hour',
      riskLevel: 'critical',
    },
    {
      loanId: 'L-00038',
      borrower: 'SP3K8B...9WXY',
      collateralAmount: 0.08,
      collateralValue: 7713,
      debtAmount: 7200,
      healthFactor: 107.1,
      ltv: 93.3,
      liquidationPrice: 90000,
      timeToLiquidation: '2-4 hours',
      riskLevel: 'critical',
    },
    {
      loanId: 'L-00035',
      borrower: 'SP1A9C...2DEF',
      collateralAmount: 0.22,
      collateralValue: 21212,
      debtAmount: 19500,
      healthFactor: 108.8,
      ltv: 91.9,
      liquidationPrice: 88636,
      timeToLiquidation: '4-8 hours',
      riskLevel: 'critical',
    },
    {
      loanId: 'L-00031',
      borrower: 'SP4M7N...8GHI',
      collateralAmount: 0.12,
      collateralValue: 11570,
      debtAmount: 10200,
      healthFactor: 113.4,
      ltv: 88.2,
      liquidationPrice: 85000,
      timeToLiquidation: '12-24 hours',
      riskLevel: 'high',
    },
    {
      loanId: 'L-00029',
      borrower: 'SP5N8P...1JKL',
      collateralAmount: 0.18,
      collateralValue: 17355,
      debtAmount: 15000,
      healthFactor: 115.7,
      ltv: 86.4,
      liquidationPrice: 83333,
      timeToLiquidation: '1-2 days',
      riskLevel: 'high',
    },
    {
      loanId: 'L-00027',
      borrower: 'SP6P9Q...5MNO',
      collateralAmount: 0.09,
      collateralValue: 8677,
      debtAmount: 7400,
      healthFactor: 117.3,
      ltv: 85.3,
      liquidationPrice: 82222,
      timeToLiquidation: '2-3 days',
      riskLevel: 'high',
    },
    {
      loanId: 'L-00024',
      borrower: 'SP7Q1R...3PQR',
      collateralAmount: 0.25,
      collateralValue: 24105,
      debtAmount: 20000,
      healthFactor: 120.5,
      ltv: 83.0,
      liquidationPrice: 80000,
      timeToLiquidation: '3-5 days',
      riskLevel: 'medium',
    },
  ] : [];

  // Use blockchain loans if available, otherwise use mock data for demo
  const displayLoans = liquidationLoans.length > 0 ? liquidationLoans : mockLoans;

  const filteredLoans = displayLoans.filter(loan => {
    if (filterRisk === 'all') return true;
    return loan.riskLevel === filterRisk;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-[#F6465D]';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-[#848E9C]';
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-[#F6465D]/10 border-[#F6465D]/30';
      case 'high': return 'bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-[#2B3139] border-[#2B3139]';
    }
  };

  const totalAtRisk = filteredLoans.reduce((sum, loan) => sum + loan.debtAmount, 0);
  const avgHealthFactor = filteredLoans.reduce((sum, loan) => sum + loan.healthFactor, 0) / filteredLoans.length;

  // Handle liquidation
  const handleLiquidate = async (loanId: string) => {
    const numericId = parseInt(loanId.replace('L-', ''));
    setLiquidatingId(numericId);
    const toastId = toast.loading('Liquidating loan...');

    try {
      const result = await liquidateLoan(numericId);
      toast.success(`Loan ${loanId} liquidated!`, { id: toastId });
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to liquidate', { id: toastId });
    } finally {
      setLiquidatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">Liquidation Monitor</h1>
          <div className="px-2 py-1 bg-[#F6465D]/10 border border-[#F6465D]/30 rounded text-xs font-semibold text-[#F6465D]">
            {filteredLoans.length} At Risk
          </div>
        </div>
        <p className="text-sm text-[#848E9C]">Monitor and liquidate under-collateralized loans to maintain protocol health</p>
      </div>

      {/* Alert Banner */}
      <div className="mb-6 p-4 bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#F6465D] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#F6465D] mb-1">Critical Risk Alert</p>
            <p className="text-xs text-[#F6465D]/80">
              {filteredLoans.filter(l => l.riskLevel === 'critical').length} loans are approaching liquidation threshold.
              Immediate action required to protect protocol funds.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">At-Risk Loans</span>
            <svg className="w-4 h-4 text-[#F6465D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-1 tabular-nums">{filteredLoans.length}</div>
          <div className="text-xs text-[#F6465D]">{filteredLoans.filter(l => l.riskLevel === 'critical').length} critical</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Total Value at Risk</span>
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-1 tabular-nums">${totalAtRisk.toLocaleString()}</div>
          <div className="text-xs text-orange-500">Across all loans</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Avg Health Factor</span>
            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-1 tabular-nums">{avgHealthFactor.toFixed(1)}%</div>
          <div className="text-xs text-yellow-500">Below safe threshold</div>
        </div>

        <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#848E9C]">Liquidation Rewards</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-1 tabular-nums">$4,850</div>
          <div className="text-xs text-emerald-500">Potential earnings</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#848E9C]">Risk Level:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as any)}
              className="px-3 py-1.5 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] rounded text-sm text-white transition-colors focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All ({displayLoans.length})</option>
              <option value="critical">Critical ({displayLoans.filter(l => l.riskLevel === 'critical').length})</option>
              <option value="high">High ({displayLoans.filter(l => l.riskLevel === 'high').length})</option>
              <option value="medium">Medium ({displayLoans.filter(l => l.riskLevel === 'medium').length})</option>
            </select>

            <span className="text-sm text-[#848E9C]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] rounded text-sm text-white transition-colors focus:outline-none focus:border-emerald-500"
            >
              <option value="healthFactor">Health Factor</option>
              <option value="debtAmount">Debt Amount</option>
              <option value="timeToLiquidation">Time to Liquidation</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 bg-[#2B3139] hover:bg-[#343840] border border-[#2B3139] rounded text-sm text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </div>
          </button>
        </div>
      </div>

      {/* Liquidation Table */}
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2B3139]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Loan ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C]">Borrower</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Health Factor</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">LTV</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Collateral Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Debt Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#848E9C]">Liq. Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Time to Liq.</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#848E9C]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, i) => (
                <tr key={i} className="border-b border-[#2B3139] hover:bg-[#2B3139]/30 transition-colors group">
                  {/* Risk Indicator */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${getRiskBgColor(loan.riskLevel)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${loan.riskLevel === 'critical' ? 'bg-[#F6465D] animate-pulse' : loan.riskLevel === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                      <span className={`text-xs font-semibold uppercase ${getRiskColor(loan.riskLevel)}`}>
                        {loan.riskLevel}
                      </span>
                    </div>
                  </td>

                  {/* Loan ID */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-white font-medium">{loan.loanId}</span>
                  </td>

                  {/* Borrower */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#848E9C] font-mono">{loan.borrower}</span>
                  </td>

                  {/* Health Factor */}
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold tabular-nums ${getRiskColor(loan.riskLevel)}`}>
                      {loan.healthFactor}%
                    </span>
                  </td>

                  {/* LTV */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-white font-semibold tabular-nums">{loan.ltv}%</span>
                  </td>

                  {/* Collateral Value */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-white font-semibold tabular-nums">${loan.collateralValue.toLocaleString()}</span>
                      <span className="text-xs text-[#848E9C] tabular-nums">{loan.collateralAmount} sBTC</span>
                    </div>
                  </td>

                  {/* Debt Amount */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-white font-semibold tabular-nums">${loan.debtAmount.toLocaleString()}</span>
                  </td>

                  {/* Liquidation Price */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-orange-500 font-semibold tabular-nums">${loan.liquidationPrice.toLocaleString()}</span>
                  </td>

                  {/* Time to Liquidation */}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold ${getRiskColor(loan.riskLevel)}`}>
                      {loan.timeToLiquidation}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleLiquidate(loan.loanId)}
                      disabled={liquidatingId === parseInt(loan.loanId.replace('L-', ''))}
                      className="px-3 py-1.5 bg-[#F6465D] hover:bg-[#F6465D]/80 disabled:bg-[#848E9C] disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                      {liquidatingId === parseInt(loan.loanId.replace('L-', '')) ? 'Liquidating...' : 'Liquidate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-blue-400 font-semibold mb-1">Liquidation Info</p>
            <p className="text-xs text-blue-300">
              Loans become eligible for liquidation when their health factor drops below 120%.
              Liquidators receive a 5% bonus from the collateral as a reward for maintaining protocol health.
              Act quickly on critical loans to prevent bad debt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
