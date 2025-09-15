import { useQuery } from '@tanstack/react-query';
import { fetchCompanyInformation, fetchQuoteData, fetchCompanyData } from '@/lib/api';

export function useCompanyInformation(ticker: string) {
  return useQuery({
    queryKey: ['companyInformation', ticker.toUpperCase()],
    queryFn: () => fetchCompanyInformation(ticker),
    enabled: !!ticker && ticker.length >= 3,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

export function useQuoteData(ticker: string) {
  return useQuery({
    queryKey: ['quoteData', ticker.toUpperCase()],
    queryFn: () => fetchQuoteData(ticker),
    enabled: !!ticker && ticker.length >= 3,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false
  });
}

export function useCompanyData(ticker: string) {
  return useQuery({
    queryKey: ['companyData', ticker.toUpperCase()],
    queryFn: () => fetchCompanyData(ticker),
    enabled: !!ticker && ticker.length >= 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

export function useMultipleCompanyData(tickers: string[]) {
  return useQuery({
    queryKey: ['multipleCompanyData', ...tickers.map(t => t.toUpperCase()).sort()],
    queryFn: async () => {
      const results = await Promise.allSettled(tickers.map(ticker => fetchCompanyData(ticker)));

      return results.map((result, index) => ({
        ticker: tickers[index].toUpperCase(),
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    },
    enabled: tickers.length > 0 && tickers.every(ticker => ticker.length >= 3),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
}
