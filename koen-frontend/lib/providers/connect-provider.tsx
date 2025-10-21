'use client';

import { useEffect, useState } from 'react';

export function ConnectProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Dynamically import userSession to avoid SSR issues
      import('../auth').then(({ userSession }) => {
        console.log('🔍 [ConnectProvider] Checking for pending sign-in...');
        console.log('🔍 [ConnectProvider] isSignInPending:', userSession.isSignInPending());

        // Handle pending authentication when redirected back from wallet
        if (userSession.isSignInPending()) {
          console.log('✅ [ConnectProvider] Pending sign-in detected! Processing...');

          // Check if this was initiated by our Connect Wallet button
          const wasInitiated = localStorage.getItem('koen_wallet_connection_initiated');
          console.log('🔍 [ConnectProvider] Connection was initiated:', wasInitiated);

          userSession.handlePendingSignIn().then((userData) => {
            console.log('✅ [ConnectProvider] Sign in complete:', userData);

            // If this was a user-initiated connection, mark it as explicitly connected
            if (wasInitiated === 'true') {
              localStorage.setItem('stackspay_wallet_explicitly_connected', 'true');
              console.log('✅ [ConnectProvider] Stored explicit connection flag');
              localStorage.removeItem('koen_wallet_connection_initiated');
            }

            // Reload to refresh the app state
            console.log('🔄 [ConnectProvider] Reloading page...');
            window.location.reload();
          }).catch((error) => {
            console.error('❌ [ConnectProvider] Error handling pending sign in:', error);
            localStorage.removeItem('koen_wallet_connection_initiated');
          });
        } else {
          console.log('ℹ️ [ConnectProvider] No pending sign-in');

          // Clean up any stale flags
          if (localStorage.getItem('koen_wallet_connection_initiated') === 'true') {
            console.log('🧹 [ConnectProvider] Cleaning up stale connection flag');
            localStorage.removeItem('koen_wallet_connection_initiated');
          }
        }
      });
    }
  }, []);

  // Don't render during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  // Simply render children without the Connect wrapper
  // We're using authenticate() directly in wallet-service.ts
  return <>{children}</>;
}
