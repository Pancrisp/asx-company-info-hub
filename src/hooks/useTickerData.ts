import { useQuery } from '@tanstack/react-query';
import { fetchCompanyInformation, fetchQuoteData } from '@/lib/api';

const isMarketHours = () => {
  const now = new Date();
  const sydneyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
  const hours = sydneyTime.getHours();
  const dayOfWeek = sydneyTime.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isTradingHours = hours >= 10 && hours < 16;

  return isWeekday && isTradingHours;
};

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
    staleTime: () => {
      return isMarketHours() ? 3 * 60 * 1000 : 60 * 60 * 1000;
    },
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: () => {
      return isMarketHours() ? 1 * 60 * 1000 : 60 * 60 * 1000;
    },
    refetchIntervalInBackground: false
  });
}

export function useCompanyData(ticker: string) {
  return useQuery({
    queryKey: ['companyData', ticker.toUpperCase()],
    queryFn: async () => {
      const [companyResult, quoteResult] = await Promise.allSettled([
        fetchCompanyInformation(ticker),
        fetchQuoteData(ticker)
      ]);

      if (companyResult.status === 'rejected' && quoteResult.status === 'rejected') {
        throw quoteResult.reason;
      }
      if (companyResult.status === 'rejected') {
        throw companyResult.reason;
      }
      if (quoteResult.status === 'rejected') {
        throw quoteResult.reason;
      }

      return {
        company: companyResult.value,
        quote: quoteResult.value
      };
    },
    enabled: !!ticker && ticker.length >= 3,
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

export function useMultipleQuoteData(tickers: string[]) {
  return useQuery({
    queryKey: ['multipleCompanyData', ...tickers.map(t => t.toUpperCase()).sort()],
    queryFn: async () => {
      const results = await Promise.allSettled(tickers.map(ticker => fetchQuoteData(ticker)));

      return results.map((result, index) => ({
        ticker: tickers[index].toUpperCase(),
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    },
    enabled: tickers.length > 0 && tickers.every(ticker => ticker.length >= 3),
    staleTime: () => {
      return isMarketHours() ? 3 * 60 * 1000 : 60 * 60 * 1000;
    },
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
    refetchInterval: () => {
      return isMarketHours() ? 1 * 60 * 1000 : 60 * 60 * 1000;
    },
    refetchIntervalInBackground: false
  });
}
