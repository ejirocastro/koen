/**
 * Loan Detail Modal Component
 *
 * Displays comprehensive loan information including:
 * - Loan terms and status
 * - Payment schedule
 * - Interest accrued
 * - Health factor (for borrower loans)
 * - Collateral details
 * - Timeline and history
 * - Actions (repay, view on explorer)
 */

'use client';

import { useState, useEffect } from 'react';
import {
  microKusdToKusd,
  satoshisToSbtc,
  bpsToPercentage,
  blocksToDays,
  formatAddress,
} from '@/lib/utils/format-helpers';
import { MARKETPLACE_CONSTANTS } from '@/lib/constants';

interface Loan {
  loanId: number;
  offerId: number;
  requestId: number;
  lender: string;
  borrower: string;
  amount: number; // In kUSD
  apr: number; // Percentage
  duration: number; // In blocks
  startBlock: number;
  endBlock: number;
  collateral: number; // In satoshis
  collateralRatio: number; // Percentage
  status: string;
  repaidAmount: number; // In kUSD
  isAtRisk?: boolean;
}

interface LoanDetailModalProps {
  loan: Loan | null;
  onClose: () => void;
  onRepay?: (loanId: number) => void;
  userAddress: string | null;
  currentBlock?: number;
  sbtcPrice?: number; // USD price of sBTC
}

export default function LoanDetailModal({
  loan,
  onClose,
  onRepay,
  userAddress,
  currentBlock = 0,
  sbtcPrice = 96420, // Default price
}: LoanDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'history'>('overview');

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!loan) return null;

  // Calculate loan metrics
  const daysTotal = blocksToDays(loan.duration);
  const daysElapsed = currentBlock > loan.startBlock
    ? blocksToDays(currentBlock - loan.startBlock)
    : 0;
  const daysRemaining = Math.max(0, blocksToDays(loan.endBlock - currentBlock));

  const isUserLender = userAddress === loan.lender;
  const isUserBorrower = userAddress === loan.borrower;

  // Calculate interest
  const totalInterest = (loan.amount * (loan.apr / 100) * daysTotal) / 365;
  const accruedInterest = (loan.amount * (loan.apr / 100) * daysElapsed) / 365;
  const totalOwed = loan.amount + totalInterest;
  const currentOwed = loan.amount + accruedInterest;
  const remainingOwed = Math.max(0, currentOwed - loan.repaidAmount);

  // Calculate progress
  const timeProgress = Math.min(100, (daysElapsed / daysTotal) * 100);
  const paymentProgress = (loan.repaidAmount / totalOwed) * 100;

  // Calculate health factor (for borrowers)
  const collateralValueUSD = (satoshisToSbtc(loan.collateral) * sbtcPrice);
  const healthFactor = (collateralValueUSD / currentOwed) * 100;
  const isHealthy = healthFactor >= 110; // Below 110% is risky

  // Calculate liquidation price
  const liquidationPrice = (currentOwed * 0.8) / satoshisToSbtc(loan.collateral);

  // Payment schedule (simplified - monthly installments)
  const numberOfPayments = Math.ceil(daysTotal / 30); // Monthly payments
  const paymentAmount = totalOwed / numberOfPayments;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1E2329] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-[#2B3139] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B0E11] border-b border-[#2B3139] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Loan #{loan.loanId}
                <span className={`px-3 py-1 text-sm rounded-full ${
                  loan.status === 'active'
                    ? loan.isAtRisk
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-emerald-500/20 text-emerald-500'
                    : loan.status === 'repaid'
                    ? 'bg-blue-500/20 text-blue-500'
                    : 'bg-[#2B3139] text-[#848E9C]'
                }`}>
                  {loan.status === 'active'
                    ? (loan.isAtRisk ? 'At Risk' : 'Active')
                    : loan.status === 'repaid'
                    ? 'Repaid'
                    : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
                  }
                </span>
              </h2>
              <p className="text-sm text-[#848E9C] mt-1">
                {isUserLender ? '🟢 You are the Lender' : isUserBorrower ? '🟠 You are the Borrower' : 'Loan Details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#848E9C] hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1E2329] p-3 rounded-lg">
              <p className="text-xs text-[#848E9C] mb-1">Principal</p>
              <p className="text-lg font-bold text-white">${loan.amount.toLocaleString()}</p>
            </div>
            <div className="bg-[#1E2329] p-3 rounded-lg">
              <p className="text-xs text-[#848E9C] mb-1">APR</p>
              <p className="text-lg font-bold text-orange-500">{loan.apr.toFixed(1)}%</p>
            </div>
            <div className="bg-[#1E2329] p-3 rounded-lg">
              <p className="text-xs text-[#848E9C] mb-1">Duration</p>
              <p className="text-lg font-bold text-white">{daysTotal} days</p>
            </div>
            <div className="bg-[#1E2329] p-3 rounded-lg">
              <p className="text-xs text-[#848E9C] mb-1">Collateral</p>
              <p className="text-lg font-bold text-accent">{satoshisToSbtc(loan.collateral).toFixed(4)} sBTC</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#0B0E11] border-b border-[#2B3139] px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-[#848E9C] hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-[#848E9C] hover:text-white'
              }`}
            >
              Payment Schedule
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-[#848E9C] hover:text-white'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#848E9C]">Time Progress</span>
                    <span className="text-white">{daysElapsed} / {daysTotal} days ({timeProgress.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-[#2B3139] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300"
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#848E9C] mt-1">{daysRemaining} days remaining</p>
                </div>

                {loan.status === 'active' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#848E9C]">Payment Progress</span>
                      <span className="text-white">${loan.repaidAmount.toFixed(2)} / ${totalOwed.toFixed(2)} ({paymentProgress.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-[#2B3139] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${paymentProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Health Factor (for borrowers) */}
              {isUserBorrower && loan.status === 'active' && (
                <div className={`p-4 rounded-lg border ${
                  isHealthy
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">Health Factor</span>
                    <span className={`text-2xl font-bold ${isHealthy ? 'text-emerald-500' : 'text-yellow-500'}`}>
                      {healthFactor.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Collateral Value:</span>
                      <span className="text-white">${collateralValueUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Current Debt:</span>
                      <span className="text-white">${currentOwed.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Liquidation Price:</span>
                      <span className={isHealthy ? 'text-emerald-500' : 'text-yellow-500'}>
                        ${liquidationPrice.toFixed(2)}
                      </span>
                    </div>
                    {!isHealthy && (
                      <p className="text-xs text-yellow-500 mt-2">
                        ⚠️ Warning: Your loan is at risk of liquidation. Add collateral or repay to improve health.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="bg-[#0B0E11] p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-white mb-3">Financial Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Principal Amount:</span>
                    <span className="text-white font-mono">${loan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Total Interest:</span>
                    <span className="text-orange-500 font-mono">${totalInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Accrued Interest:</span>
                    <span className="text-orange-500 font-mono">${accruedInterest.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#2B3139] pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total to Repay:</span>
                      <span className="text-accent font-mono">${totalOwed.toFixed(2)}</span>
                    </div>
                  </div>
                  {loan.repaidAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#848E9C]">Already Paid:</span>
                        <span className="text-emerald-500 font-mono">${loan.repaidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Remaining:</span>
                        <span className="text-white font-mono">${remainingOwed.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0B0E11] p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-[#848E9C] mb-2">Lender</h4>
                  <p className="text-white font-mono text-sm break-all">{formatAddress(loan.lender)}</p>
                  {isUserLender && <span className="text-xs text-emerald-500 mt-1 inline-block">You</span>}
                </div>
                <div className="bg-[#0B0E11] p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-[#848E9C] mb-2">Borrower</h4>
                  <p className="text-white font-mono text-sm break-all">{formatAddress(loan.borrower)}</p>
                  {isUserBorrower && <span className="text-xs text-orange-500 mt-1 inline-block">You</span>}
                </div>
              </div>

              {/* Collateral Details */}
              <div className="bg-[#0B0E11] p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-3">Collateral Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Collateral Amount:</span>
                    <span className="text-accent font-mono">{satoshisToSbtc(loan.collateral).toFixed(8)} sBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">sBTC Price:</span>
                    <span className="text-white font-mono">${sbtcPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Collateral Value:</span>
                    <span className="text-white font-mono">${collateralValueUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Collateral Ratio:</span>
                    <span className="text-white font-mono">{loan.collateralRatio.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-[#0B0E11] p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-3">Payment Schedule</h3>
                <p className="text-sm text-[#848E9C] mb-4">
                  Estimated monthly installments over {daysTotal} days
                </p>

                <div className="space-y-3">
                  {Array.from({ length: numberOfPayments }).map((_, index) => {
                    const paymentDate = loan.startBlock + ((index + 1) * (loan.duration / numberOfPayments));
                    const isPaid = loan.repaidAmount >= paymentAmount * (index + 1);
                    const isOverdue = currentBlock > paymentDate && !isPaid && loan.status === 'active';

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isPaid
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : isOverdue
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-[#1E2329] border-[#2B3139]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isPaid
                              ? 'bg-emerald-500 text-white'
                              : isOverdue
                              ? 'bg-red-500 text-white'
                              : 'bg-[#2B3139] text-[#848E9C]'
                          }`}>
                            {isPaid ? '✓' : index + 1}
                          </div>
                          <div>
                            <p className="text-sm text-white">Payment {index + 1}</p>
                            <p className="text-xs text-[#848E9C]">
                              Block {paymentDate.toFixed(0)} (~{blocksToDays(paymentDate - loan.startBlock)} days)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-mono ${
                            isPaid ? 'text-emerald-500' : isOverdue ? 'text-red-500' : 'text-white'
                          }`}>
                            ${paymentAmount.toFixed(2)}
                          </p>
                          {isOverdue && <p className="text-xs text-red-500">Overdue</p>}
                          {isPaid && <p className="text-xs text-emerald-500">Paid</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="relative pl-8">
                {/* Timeline events */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[#2B3139]" />

                {/* Loan Created */}
                <div className="relative mb-8">
                  <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-accent border-4 border-[#1E2329]" />
                  <div className="bg-[#0B0E11] p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">Loan Created</h4>
                        <p className="text-sm text-[#848E9C]">Block {loan.startBlock}</p>
                      </div>
                      <span className="text-xs text-accent px-2 py-1 bg-accent/10 rounded">Start</span>
                    </div>
                    <p className="text-sm text-[#848E9C]">
                      Loan of ${loan.amount.toLocaleString()} kUSD at {loan.apr}% APR
                    </p>
                  </div>
                </div>

                {/* Payment Events */}
                {loan.repaidAmount > 0 && loan.status === 'active' && (
                  <div className="relative mb-8">
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#1E2329]" />
                    <div className="bg-[#0B0E11] p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">Payment Received</h4>
                          <p className="text-sm text-[#848E9C]">Block ~{currentBlock}</p>
                        </div>
                        <span className="text-xs text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded">Paid</span>
                      </div>
                      <p className="text-sm text-emerald-500">
                        ${loan.repaidAmount.toFixed(2)} kUSD paid
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Status */}
                {loan.status === 'active' && (
                  <div className="relative mb-8">
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-yellow-500 border-4 border-[#1E2329] animate-pulse" />
                    <div className="bg-[#0B0E11] p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">Current</h4>
                          <p className="text-sm text-[#848E9C]">Block {currentBlock}</p>
                        </div>
                        <span className="text-xs text-yellow-500 px-2 py-1 bg-yellow-500/10 rounded">Active</span>
                      </div>
                      <p className="text-sm text-[#848E9C]">
                        {daysRemaining} days remaining until maturity
                      </p>
                    </div>
                  </div>
                )}

                {/* Loan Due */}
                <div className="relative">
                  <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-4 border-[#1E2329] ${
                    loan.status === 'repaid' ? 'bg-emerald-500' : 'bg-[#2B3139]'
                  }`} />
                  <div className="bg-[#0B0E11] p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">
                          {loan.status === 'repaid' ? 'Loan Repaid' : 'Maturity Date'}
                        </h4>
                        <p className="text-sm text-[#848E9C]">Block {loan.endBlock}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        loan.status === 'repaid'
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : 'text-[#848E9C] bg-[#2B3139]'
                      }`}>
                        {loan.status === 'repaid' ? 'Completed' : 'Due'}
                      </span>
                    </div>
                    <p className="text-sm text-[#848E9C]">
                      {loan.status === 'repaid'
                        ? 'Loan fully repaid and closed'
                        : `Total of $${totalOwed.toFixed(2)} kUSD due`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0B0E11] border-t border-[#2B3139] p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {isUserBorrower && loan.status === 'active' && onRepay && (
              <button
                onClick={() => {
                  onRepay(loan.loanId);
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                Repay Loan
              </button>
            )}
            <a
              href={`https://explorer.hiro.so/txid/LOAN-${loan.loanId}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-[#2B3139] hover:bg-[#343840] text-white font-semibold rounded-lg transition-colors text-center"
            >
              View on Explorer
            </a>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#2B3139] hover:bg-[#343840] text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
