/**
 * TopBar Component
 *
 * Fixed header bar displayed at the top of all dashboard pages.
 * Shows market information, wallet status, and navigation controls.
 *
 * Features:
 * - Real-time sBTC price ticker with 24h change
 * - Network indicator (testnet/mainnet)
 * - Wallet connection status
 * - Mobile hamburger menu
 * - Notification and settings buttons
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Props for the TopBar component
 */
interface TopBarProps {
  onMenuClick?: () => void;  // Callback for mobile menu toggle
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [btcPrice, setBtcPrice] = useState<number>(96420);
  const [priceChange, setPriceChange] = useState<number>(2.34);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0B0E11] border-b border-[#1E2329]">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left - Logo & Market Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[#1E2329] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pr-4 border-r border-[#1E2329] hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold text-sm">
              K
            </div>
            <span className="text-sm font-semibold text-white hidden lg:block">Kōen</span>
          </Link>

          {/* Market Price Ticker */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#848E9C]">sBTC</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  network === 'testnet' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {network === 'testnet' ? 'TESTNET' : 'MAINNET'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-white tabular-nums">${btcPrice.toLocaleString()}</span>
                <span className={`text-xs tabular-nums ${priceChange >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange}%
                </span>
              </div>
            </div>

            {/* 24h Stats */}
            <div className="hidden xl:flex items-center gap-6 text-xs">
              <div className="flex flex-col">
                <span className="text-[#848E9C]">24h High</span>
                <span className="text-white tabular-nums">$98,250</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#848E9C]">24h Low</span>
                <span className="text-white tabular-nums">$94,100</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#848E9C]">24h Volume</span>
                <span className="text-white tabular-nums">$2.4M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Wallet & Actions */}
        <div className="flex items-center gap-3">
          {/* Total Balance */}
          <div className="hidden lg:flex flex-col items-end px-4 border-r border-[#1E2329]">
            <span className="text-xs text-[#848E9C]">Total Balance</span>
            <span className="text-sm font-semibold text-white tabular-nums">$15,750.00</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-[#1E2329] rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F6465D] rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-[#1E2329] rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Wallet */}
          <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
            <span className="text-xs font-semibold text-emerald-500">SP2J6Z...4XYZ</span>
          </button>
        </div>
      </div>
    </header>
  );
}
