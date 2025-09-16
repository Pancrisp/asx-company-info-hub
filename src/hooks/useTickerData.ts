import { useQuery, useQueries } from '@tanstack/react-query';
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

export function useMultipleQuoteData(tickers: string[]) {
  const queries = useQueries({
    queries: tickers.map(ticker => ({
      queryKey: ['quoteData', ticker.toUpperCase()],
      queryFn: () => fetchQuoteData(ticker),
      enabled: !!ticker && ticker.length >= 3,
      staleTime: () => {
        return isMarketHours() ? 3 * 60 * 1000 : 60 * 60 * 1000;
      },
      gcTime: 2 * 60 * 60 * 1000,
      retry: 1,
      refetchInterval: () => {
        return isMarketHours() ? 1 * 60 * 1000 : 60 * 60 * 1000;
      },
      refetchIntervalInBackground: false
    }))
  });

  const tickerIndexMap = new Map<string, number>();
  tickers.forEach((ticker, index) => {
    tickerIndexMap.set(ticker.toUpperCase(), index);
  });

  const data = queries.map((query, index) => ({
    ticker: tickers[index].toUpperCase(),
    data: query.data || null,
    error: query.error || null
  }));

  const isLoading = queries.some(query => query.isLoading);
  const error = queries.find(query => query.error)?.error || null;

  const isQuoteLoading = (ticker: string): boolean => {
    const index = tickerIndexMap.get(ticker.toUpperCase());
    if (index === undefined) return false;
    return queries[index]?.isLoading || false;
  };

  return { data, isLoading, isQuoteLoading, error };
}
