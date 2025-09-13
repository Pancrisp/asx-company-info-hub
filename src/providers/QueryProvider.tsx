'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default
            gcTime: 5 * 60 * 1000, // 5 minutes default (replaces cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors except for 408, 429
              if (
                error?.status >= 400 &&
                error?.status < 500 &&
                ![408, 429].includes(error?.status)
              ) {
                return false;
              }
              return failureCount < 3;
            }
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
