'use client';

import { useState } from 'react';

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<'offer' | 'request'>('offer');
  const [formData, setFormData] = useState({
    amount: '',
    apr: '',
    duration: '90',
    collateral: 'sBTC',
    maxLtv: '50',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePreview = () => {
    const amount = parseFloat(formData.amount) || 0;
    const apr = parseFloat(formData.apr) || 0;
    const days = parseInt(formData.duration) || 90;
    const interest = (amount * apr * days) / (365 * 100);
    const total = amount + interest;

    return { amount, apr, days, interest, total };
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Create New {activeTab === 'offer' ? 'Lending Offer' : 'Borrow Request'}</h1>
        <p className="text-sm text-[#848E9C]">Set your terms and conditions for {activeTab === 'offer' ? 'lending' : 'borrowing'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-[#2B3139]">
              <button
                onClick={() => setActiveTab('offer')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'offer'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Lending Offer</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('request')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'request'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                    : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Borrow Request</span>
                </div>
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Amount {activeTab === 'offer' ? 'to Lend' : 'to Borrow'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white text-lg font-semibold placeholder-[#848E9C] transition-colors focus:outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm text-[#848E9C]">kUSD</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#848E9C]">Available: 10,500.00 kUSD</span>
                  <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">Max</button>
                </div>
              </div>

              {/* APR */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {activeTab === 'offer' ? 'APR (Annual Percentage Rate)' : 'Max APR Willing to Pay'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.apr}
                    onChange={(e) => handleInputChange('apr', e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white text-lg font-semibold placeholder-[#848E9C] transition-colors focus:outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-sm text-[#848E9C]">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#848E9C]">Market avg:</span>
                  <span className="text-xs text-emerald-500">5.8%</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white transition-colors focus:outline-none"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="120">120 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                </select>
              </div>

              {/* Collateral Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Collateral Type</label>
                <select
                  value={formData.collateral}
                  onChange={(e) => handleInputChange('collateral', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white transition-colors focus:outline-none"
                >
                  <option value="sBTC">sBTC (Stacked Bitcoin)</option>
                </select>
              </div>

              {/* Max LTV */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Maximum LTV (Loan-to-Value)</label>
                <div className="relative">
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    value={formData.maxLtv}
                    onChange={(e) => handleInputChange('maxLtv', e.target.value)}
                    className="w-full h-2 bg-[#2B3139] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-[#848E9C]">30%</span>
                    <span className={`text-sm font-semibold ${activeTab === 'offer' ? 'text-emerald-500' : 'text-orange-500'}`}>{formData.maxLtv}%</span>
                    <span className="text-xs text-[#848E9C]">80%</span>
                  </div>
                </div>
                <p className="text-xs text-[#848E9C] mt-2">Lower LTV = Less risk, higher LTV = More risk</p>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-[#2B3139] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-emerald-500" />
                  <div>
                    <p className="text-sm text-white mb-1">I agree to the terms and conditions</p>
                    <p className="text-xs text-[#848E9C]">
                      By creating this {activeTab === 'offer' ? 'offer' : 'request'}, you agree to the protocol's smart contract terms, including liquidation rules and interest calculations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-bold text-white mb-4">Transaction Preview</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848E9C]">Amount</span>
                <span className="text-sm text-white font-semibold tabular-nums">${preview.amount.toLocaleString()} kUSD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848E9C]">APR</span>
                <span className={`text-sm font-semibold tabular-nums ${activeTab === 'offer' ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {preview.apr}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848E9C]">Duration</span>
                <span className="text-sm text-white tabular-nums">{preview.days} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848E9C]">Collateral</span>
                <span className="text-sm text-white">{formData.collateral}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848E9C]">Max LTV</span>
                <span className="text-sm text-white tabular-nums">{formData.maxLtv}%</span>
              </div>

              <div className="border-t border-[#2B3139] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#848E9C]">Est. Interest</span>
                  <span className={`text-sm font-semibold tabular-nums ${activeTab === 'offer' ? 'text-[#0ECB81]' : 'text-orange-500'}`}>
                    ${preview.interest.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Total {activeTab === 'offer' ? 'Return' : 'Repayment'}</span>
                  <span className="text-lg font-bold text-white tabular-nums">${preview.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className={`w-full px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'offer'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}>
                Create {activeTab === 'offer' ? 'Offer' : 'Request'}
              </button>
              <button className="w-full px-4 py-3 bg-[#2B3139] hover:bg-[#343840] text-white text-sm font-semibold rounded-lg transition-colors">
                Cancel
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-blue-400 font-semibold mb-1">Quick Tip</p>
                  <p className="text-xs text-blue-300">
                    {activeTab === 'offer'
                      ? 'Lower APR attracts more borrowers but reduces your returns. Market average is 5.8%.'
                      : 'Higher collateral ratio improves your chances of getting matched with lenders.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
