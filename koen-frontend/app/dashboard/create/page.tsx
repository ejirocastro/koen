/**
 * Create Offer/Request Page
 *
 * Main page for creating new lending offers and borrow requests.
 * Users can switch between two tabs:
 * - Lending Offer: Lend kUSD to borrowers at specified terms
 * - Borrow Request: Request kUSD loan by depositing sBTC collateral
 *
 * Features:
 * - Form validation with balance checks
 * - Oracle price update functionality (required for testnet)
 * - kUSD faucet for testing
 * - Transaction notifications with explorer links
 * - Terms and conditions agreement
 * - Real-time loan preview with interest calculations
 *
 * Important Notes:
 * - Oracle price must be fresh (<144 blocks old) to create offers/requests
 * - Lenders need sufficient kUSD balance
 * - Borrowers need sufficient sBTC for collateral
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useTokenBalances, useMarketplaceStats, useOracleFreshness, useUserSettings, useActiveOffers } from '@/lib/hooks';
import { microKusdToKusd, satoshisToSbtc, daysToBlocks, blocksToDays, percentageToBps, sbtcToSatoshis, kusdToMicroKusd } from '@/lib/utils/format-helpers';
import { createLendingOffer, createBorrowRequest } from '@/lib/contracts/p2p-marketplace';
import { requestKusdFaucet } from '@/lib/contracts/kusd-token';
import { updateSbtcPrice } from '@/lib/contracts/oracle';
import toast from 'react-hot-toast';

export default function CreatePage() {
  const router = useRouter();

  // Get user settings for form defaults
  const { settings } = useUserSettings();

  // UI state management
  const [activeTab, setActiveTab] = useState<'offer' | 'request'>('offer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Form data state - stores all user input values
  // Initialize with user's preferred defaults from settings
  const [formData, setFormData] = useState({
    amount: '',
    apr: '',
    duration: blocksToDays(settings.trading.defaultDuration).toString(),
    collateral: 'sBTC',
    collateralRatio: (settings.trading.defaultCollateralRatio / 100).toString(),
    minReputation: '0',
    collateralAmount: '',
  });

  // Update form defaults when settings change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      duration: blocksToDays(settings.trading.defaultDuration).toString(),
      collateralRatio: (settings.trading.defaultCollateralRatio / 100).toString(),
    }));
  }, [settings.trading.defaultDuration, settings.trading.defaultCollateralRatio]);

  // Get wallet connection
  const { address, isConnected, connectWallet } = useWallet();

  // Fetch real data
  const { kusd, sbtc, isLoading: balancesLoading } = useTokenBalances(address);
  const { data: stats, isLoading: statsLoading } = useMarketplaceStats();
  const { data: oracleFreshness, refetch: refetchOracle } = useOracleFreshness();
  const { data: activeOffers } = useActiveOffers(50); // Fetch offers to calculate average APR

  const isLoading = balancesLoading || statsLoading;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    const apr = parseFloat(formData.apr);
    const duration = parseInt(formData.duration);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (activeTab === 'offer') {
      const availableKusd = kusd; // Already in kUSD format from hook
      if (amount > availableKusd) {
        toast.error(`Insufficient kUSD balance. You have ${availableKusd.toLocaleString()} kUSD`);
        return false;
      }
    }

    if (activeTab === 'request') {
      const collateralAmount = parseFloat(formData.collateralAmount);
      const availableSbtc = sbtc; // Already in sBTC format from hook
      if (!collateralAmount || collateralAmount <= 0) {
        toast.error('Please enter collateral amount');
        return false;
      }
      if (collateralAmount > availableSbtc) {
        toast.error(`Insufficient sBTC balance. You have ${availableSbtc.toFixed(4)} sBTC`);
        return false;
      }
    }

    if (!apr || apr < 0 || apr > 100) {
      toast.error('Please enter a valid APR between 0% and 100%');
      return false;
    }

    if (!duration || duration < 1) {
      toast.error('Please select a valid duration');
      return false;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleCreateOffer = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Creating lending offer...');

    try {
      const amount = parseFloat(formData.amount);
      const apr = parseFloat(formData.apr);
      const duration = parseInt(formData.duration);
      const minReputation = parseInt(formData.minReputation);
      const collateralRatio = parseInt(formData.collateralRatio);

      console.log('Creating offer with params:', {
        amount: amount,
        apr: apr,
        duration: duration,
        minReputation,
        collateralRatio,
        'amount (micro-kUSD)': amount * 1_000_000,
        'apr (bps)': apr * 100,
        'duration (blocks)': duration * 144,
        'collateral ratio (bps)': collateralRatio * 100,
        'your kUSD balance': kusd,
      });

      const result = await createLendingOffer({
        amount,
        apr,
        duration,
        minReputation,
        collateralRatio,
      });

      // Transaction was broadcast successfully
      const txId = result.txId;
      toast.success(
        <div>
          <div>Offer created successfully!</div>
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 block"
          >
            View on Explorer
          </a>
          <div className="text-xs mt-1">Redirecting to marketplace...</div>
        </div>,
        { id: toastId, duration: 4000 }
      );

      // Navigate to marketplace to see the offer
      setTimeout(() => {
        router.push('/dashboard/marketplace');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.message || 'Failed to create lending offer', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Creating borrow request...');

    try {
      const amount = parseFloat(formData.amount);
      const maxApr = percentageToBps(parseFloat(formData.apr));
      const duration = daysToBlocks(parseInt(formData.duration));
      const collateralAmount = parseFloat(formData.collateralAmount);

      const result = await createBorrowRequest({
        amount,
        maxApr,
        duration,
        collateralAmount,
      });

      // Transaction was broadcast successfully
      const txId = result.txId;
      toast.success(
        <div>
          <div>Request created successfully!</div>
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 block"
          >
            View on Explorer
          </a>
          <div className="text-xs mt-1">Redirecting to marketplace...</div>
        </div>,
        { id: toastId, duration: 4000 }
      );

      // Navigate to marketplace to see the request
      setTimeout(() => {
        router.push('/dashboard/marketplace');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Failed to create borrow request', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 'offer') {
      await handleCreateOffer();
    } else {
      await handleCreateRequest();
    }
  };

  const handleFaucetRequest = async () => {
    setIsFaucetLoading(true);
    const toastId = toast.loading('Requesting 1000 kUSD from faucet...');

    try {
      await requestKusdFaucet();
      toast.success('Successfully received 1000 kUSD! Balance will update in a few seconds.', {
        id: toastId,
        duration: 6000,
      });
    } catch (error: any) {
      console.error('Error requesting faucet:', error);
      toast.error(error.message || 'Failed to request faucet. Please try again.', { id: toastId });
    } finally {
      setIsFaucetLoading(false);
    }
  };

  const handleUpdateOraclePrice = async () => {
    const toastId = toast.loading('Updating sBTC oracle price to $96,420...');

    try {
      const result = await updateSbtcPrice(96420);
      toast.success(
        <>
          Oracle price update submitted! Transaction: {' '}
          <a
            href={`https://explorer.hiro.so/txid/${result.txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {result.txId.slice(0, 8)}...
          </a>
          <br />
          <span className="text-xs">⏳ Waiting for confirmation (~1-2 min). Price will be fresh after confirmation.</span>
        </>,
        {
          id: toastId,
          duration: 15000,
        }
      );

      // Poll for oracle freshness update every 10 seconds for up to 3 minutes
      let attempts = 0;
      const maxAttempts = 18; // 3 minutes
      const pollInterval = setInterval(async () => {
        attempts++;
        const freshness = await refetchOracle();

        if (freshness.data?.isFresh) {
          clearInterval(pollInterval);
          toast.success('✅ Oracle price is now fresh! You can create offers/requests now.', {
            duration: 8000,
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          toast('Oracle update taking longer than expected. Please check the transaction status.', {
            duration: 6000,
          });
        }
      }, 10000);
    } catch (error: any) {
      console.error('Error updating oracle:', error);
      toast.error(error.message || 'Failed to update oracle price', { id: toastId });
    }
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

  // Market average APR - calculate from active offers or use fallback
  const marketAvgApr = activeOffers && activeOffers.length > 0
    ? activeOffers.reduce((sum, offer) => sum + offer.apr, 0) / activeOffers.length / 100 // Convert basis points to percentage
    : 5.8; // Fallback if no offers available

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0B0E11] text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-12">
            <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Connect Wallet to Create Offers/Requests</h2>
            <p className="text-sm text-[#848E9C] mb-6">Connect your wallet to create lending offers or borrow requests</p>
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
        <h1 className="text-2xl font-bold text-white mb-2">Create New {activeTab === 'offer' ? 'Lending Offer' : 'Borrow Request'}</h1>
        <p className="text-sm text-[#848E9C]">Set your terms and conditions for {activeTab === 'offer' ? 'lending' : 'borrowing'}</p>
      </div>

      {/* Testnet API Notice */}
      {!isLoading && (kusd === 0 && sbtc === 0) && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-yellow-400 font-semibold mb-1">Testnet API Issue Detected</p>
              <p className="text-xs text-yellow-300">
                The Hiro testnet API may be experiencing issues. If you see zero balances or errors, this is likely temporary.
                Transactions can still be submitted when the API recovers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Display */}
      {isLoading ? (
        <div className="mb-6 p-4 bg-[#1E2329] border border-[#2B3139] rounded-lg text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="mt-2 text-xs text-[#848E9C]">Loading balances...</p>
        </div>
      ) : (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#1E2329] border border-[#2B3139] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#848E9C]">Your kUSD Balance</span>
                <span className="text-lg text-white font-semibold tabular-nums">${kusd.toLocaleString()}</span>
              </div>
              <button
                onClick={handleFaucetRequest}
                disabled={isFaucetLoading || isSubmitting}
                className={`w-full mt-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-500 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  isFaucetLoading || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                {isFaucetLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-emerald-500"></div>
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Get Test Tokens (1000 kUSD)</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-[#1E2329] border border-[#2B3139] rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#848E9C]">Your sBTC Balance</span>
                <span className="text-lg text-white font-semibold tabular-nums">{sbtc.toFixed(4)} sBTC</span>
              </div>
            </div>
          </div>

          {/* Oracle Price Status & Update Button */}
          <div className={`p-4 border rounded-lg ${
            oracleFreshness?.isFresh
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-yellow-500/5 border-yellow-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {oracleFreshness?.isFresh ? (
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  oracleFreshness?.isFresh ? 'text-emerald-500' : 'text-yellow-500'
                }`}>
                  {oracleFreshness?.isFresh ? '✅ Oracle Price is Fresh' : '⚠️ Oracle Price Update Required'}
                </p>
                <p className="text-xs text-[#848E9C] mb-3">
                  {oracleFreshness?.message || 'Checking oracle status...'}
                  {oracleFreshness?.lastUpdateBlock !== undefined && oracleFreshness.lastUpdateBlock > 0 && (
                    <span className="block mt-1">
                      Last update: Block #{oracleFreshness.lastUpdateBlock}
                    </span>
                  )}
                </p>
                {!oracleFreshness?.isFresh && (
                  <button
                    onClick={handleUpdateOraclePrice}
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-500 text-xs font-semibold transition-all flex items-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Update Oracle Price ($96,420)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-[#2B3139]">
              <button
                onClick={() => setActiveTab('offer')}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'offer'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'request'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                    : 'bg-[#2B3139] text-[#848E9C] hover:text-white'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white text-lg font-semibold placeholder-[#848E9C] transition-colors focus:outline-none ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm text-[#848E9C]">kUSD</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#848E9C]">
                    Available: {kusd.toLocaleString()} kUSD
                  </span>
                  <button
                    onClick={() => handleInputChange('amount', kusd.toString())}
                    disabled={isSubmitting}
                    className={`text-xs text-emerald-500 hover:text-emerald-400 transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Collateral Amount (for Borrow Request only) */}
              {activeTab === 'request' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Collateral Amount (sBTC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.collateralAmount}
                      onChange={(e) => handleInputChange('collateralAmount', e.target.value)}
                      placeholder="0.0000"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white text-lg font-semibold placeholder-[#848E9C] transition-colors focus:outline-none ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-sm text-[#848E9C]">sBTC</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#848E9C]">
                      Available: {sbtc.toFixed(4)} sBTC
                    </span>
                    <button
                      onClick={() => handleInputChange('collateralAmount', sbtc.toString())}
                      disabled={isSubmitting}
                      className={`text-xs text-emerald-500 hover:text-emerald-400 transition-colors ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Max
                    </button>
                  </div>
                </div>
              )}

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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white text-lg font-semibold placeholder-[#848E9C] transition-colors focus:outline-none ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-sm text-[#848E9C]">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#848E9C]">Market avg:</span>
                  <span className="text-xs text-emerald-500">{marketAvgApr}%</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white transition-colors focus:outline-none ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="120">120 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                </select>
              </div>

              {/* Collateral Ratio (for Lending Offer only) */}
              {activeTab === 'offer' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Collateral Ratio (Minimum)</label>
                  <div className="relative">
                    <input
                      type="range"
                      min="100"
                      max="200"
                      step="10"
                      value={formData.collateralRatio}
                      onChange={(e) => handleInputChange('collateralRatio', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full h-2 bg-[#2B3139] rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-[#848E9C]">100%</span>
                      <span className="text-sm font-semibold text-emerald-500">{formData.collateralRatio}%</span>
                      <span className="text-xs text-[#848E9C]">200%</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#848E9C] mt-2">Higher ratio = Lower risk for lender</p>
                </div>
              )}

              {/* Min Reputation (for Lending Offer only) */}
              {activeTab === 'offer' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Minimum Reputation Score</label>
                  <select
                    value={formData.minReputation}
                    onChange={(e) => handleInputChange('minReputation', e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-[#2B3139] border border-[#2B3139] hover:border-[#848E9C] focus:border-emerald-500 rounded-lg text-white transition-colors focus:outline-none ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="0">Any (Bronze+)</option>
                    <option value="500">500+ (Silver+)</option>
                    <option value="1000">1000+ (Gold)</option>
                  </select>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="bg-[#2B3139] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    disabled={isSubmitting}
                    className={`mt-1 w-4 h-4 accent-emerald-500 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  />
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
              {activeTab === 'offer' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#848E9C]">Min Collateral</span>
                  <span className="text-sm text-white tabular-nums">{formData.collateralRatio}%</span>
                </div>
              )}
              {activeTab === 'request' && formData.collateralAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#848E9C]">Collateral Amount</span>
                  <span className="text-sm text-white tabular-nums">{parseFloat(formData.collateralAmount).toFixed(4)} sBTC</span>
                </div>
              )}

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
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !agreeToTerms}
                className={`w-full px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'offer'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } ${
                  isSubmitting || !agreeToTerms ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create {activeTab === 'offer' ? 'Offer' : 'Request'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
              <button
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-[#2B3139] hover:bg-[#343840] text-white text-sm font-semibold rounded-lg transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
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
