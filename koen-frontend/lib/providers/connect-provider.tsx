'use client';

import { Connect } from '@stacks/connect-react';
import { useEffect, useState } from 'react';

export function ConnectProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Dynamically import userSession to avoid SSR issues
      import('../auth').then(({ userSession }) => {
        // Handle pending authentication when redirected back from wallet
        if (userSession.isSignInPending()) {
          userSession.handlePendingSignIn().then((userData) => {
            console.log('Sign in complete:', userData);
            // Store the explicit connection flag
            localStorage.setItem('stackspay_wallet_explicitly_connected', 'true');
            // Reload to refresh the app state
            window.location.reload();
          }).catch((error) => {
            console.error('Error handling pending sign in:', error);
          });
        }
      });
    }
  }, []);

  // Don't render Connect component during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: 'Kōen Protocol',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: '/',
        onFinish: () => {
          console.log('Auth finished');
        },
      }}
    >
      {children}
    </Connect>
  );
}
