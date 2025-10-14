'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Refetch data when window regains focus
            refetchOnWindowFocus: true,
            // Retry failed requests 3 times
            retry: 3,
            // Consider data stale after 30 seconds
            staleTime: 30000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
