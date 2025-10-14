'use client';

import { useState, useEffect } from 'react';
import walletService from '../../wallet-service';
import type { WalletConnectionResult } from '../../wallet';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  walletType?: string;
  network?: string;
}

/**
 * Unified wallet hook using walletService
 * This replaces the old basic implementation with the production-ready walletService
 */
export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isLoading: true,
  });

  // Check wallet connection on mount
  useEffect(() => {
    async function checkConnection() {
      try {
        const walletData = await walletService.getCurrentWalletData();

        if (walletData) {
          setState({
            isConnected: true,
            address: walletData.address,
            isLoading: false,
            walletType: walletData.walletType,
            network: walletData.network,
          });
        } else {
          setState({
            isConnected: false,
            address: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setState({
          isConnected: false,
          address: null,
          isLoading: false,
        });
      }
    }

    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const walletInfo = await walletService.connectWallet();

      setState({
        isConnected: true,
        address: walletInfo.address,
        isLoading: false,
      });

      return walletInfo;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();

      setState({
        isConnected: false,
        address: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
}
