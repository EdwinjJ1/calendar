/**
 * React Query Provider
 * 
 * Provides React Query client to the application.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time of 1 minute
            staleTime: 60 * 1000,
            // Cache time of 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry once on failure
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Retry once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;

