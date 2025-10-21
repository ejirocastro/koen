'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import walletService from '../wallet-service';

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // On mount, check if wallet is already connected
  // This also catches the redirect back from authentication
  useEffect(() => {
    async function checkWallet() {
      console.log('[Navbar] Checking wallet on mount/redirect...');
      const data = await walletService.getCurrentWalletData();
      console.log('[Navbar] Wallet data from getCurrentWalletData:', data);
      if (data?.address) {
        console.log('✅ [Navbar] Wallet already connected:', data.address);
        setWalletAddress(data.address);
      } else {
        console.log('[Navbar] No wallet connected yet');
      }
    }
    checkWallet();
  }, []);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      console.log('[Navbar] Starting wallet connection...');
      const info = await walletService.connectWallet();
      console.log('[Navbar] Wallet connection response:', info);

      // If we got an address, show it
      if (info.address) {
        console.log('✅ [Navbar] Wallet connected immediately:', info.address);
        setWalletAddress(info.address);
        setConnecting(false);
      } else {
        // No address yet - this means a redirect is happening
        // Keep the button in "connecting" state
        console.log('🔄 [Navbar] Wallet authentication in progress (popup/redirect)...');
        // The page will reload after redirect, or the popup will complete
        // Don't set connecting to false - it will reset on page reload or popup completion
      }
    } catch (e) {
      // Handle errors
      console.error('[Navbar] Wallet connection failed:', e);

      // Only show error alert if it's not a user cancellation
      if (e instanceof Error && !e.message.includes('cancelled')) {
        alert(`Failed to connect wallet: ${e.message}`);
      }

      setConnecting(false);
    }
  };

  // Disconnect wallet handler
  const handleDisconnectWallet = async () => {
    await walletService.disconnectWallet();
    setWalletAddress(null);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl font-bold text-background">
              K
            </div>
            <span className="text-2xl font-bold">
              <span className="text-gradient">Kōen</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              How It Works
            </a>
            <a href="#stats" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              Stats
            </a>
            <a href="#docs" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              Docs
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <span className="text-accent font-mono text-sm bg-accent/10 px-3 py-1 rounded-lg">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button
                  className="ml-2 px-3 py-1 text-xs rounded bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition"
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="group relative px-5 py-2 bg-transparent border border-accent/50 hover:border-accent text-accent font-semibold rounded-lg transition-all duration-300 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 overflow-hidden hover:scale-105 transform"
                onClick={handleConnectWallet}
                disabled={connecting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 relative z-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
                <span className="relative z-10">{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="#features" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              How It Works
            </a>
            <a href="#stats" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              Stats
            </a>
            <a href="#docs" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              Docs
            </a>
            <div className="pt-4">
              {walletAddress ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-accent font-mono text-sm bg-accent/10 px-3 py-1 rounded-lg">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <button
                    className="ml-2 px-3 py-1 text-xs rounded bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition"
                    onClick={handleDisconnectWallet}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  className="group relative w-full px-5 py-2 bg-transparent border border-accent/50 hover:border-accent text-accent font-semibold rounded-lg transition-all duration-300 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 justify-center overflow-hidden hover:scale-105 transform"
                  onClick={handleConnectWallet}
                  disabled={connecting}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 relative z-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                  </svg>
                  <span className="relative z-10">{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
