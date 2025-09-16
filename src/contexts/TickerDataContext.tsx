'use client';

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { useMultipleQuoteData, useCompanyInformation } from '@/hooks/useTickerData';
import { QuoteData } from '@/types/schema';
import { POPULAR_STOCKS } from '@/data/stocks';

interface TickerDataContextValue {
  getQuoteData: (ticker: string) => QuoteData | null;
  isLoading: boolean;
  isTickerLoading: (tickers: string[]) => boolean;
  error: (ticker: string) => Error | null;
  watchTickers: (tickers: string[]) => void;
  unwatchTickers: (tickers: string[]) => void;
  watchedTickers: string[];
}

const TickerDataContext = createContext<TickerDataContextValue | undefined>(undefined);

interface TickerDataProviderProps {
  children: ReactNode;
}

const WATCHLIST_STORAGE_KEY = 'asx-watchlist';

export function TickerDataProvider({ children }: TickerDataProviderProps) {
  const [watchedTickers, setWatchedTickers] = useState<string[]>(() => {
    const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);

    const watchlistedTickers: string[] = [];
    try {
      if (typeof window !== 'undefined') {
        const tickers = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (tickers) {
          const parsedTickers = JSON.parse(tickers);
          if (Array.isArray(parsedTickers)) {
            watchlistedTickers.push(...parsedTickers);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load watchlisted tickers from localStorage:', error);
    }

    const allTickers = [...trendingTickers, ...watchlistedTickers];
    return Array.from(new Set(allTickers));
  });

  const multipleQuoteQuery = useMultipleQuoteData(watchedTickers);

  const getQuoteData = (ticker: string): QuoteData | null => {
    if (!multipleQuoteQuery.data) return null;

    const tickerData = multipleQuoteQuery.data.find(
      result => result.ticker === ticker.toUpperCase()
    );

    return tickerData?.data || null;
  };

  const isLoading = multipleQuoteQuery.isLoading;

  const isTickerLoading = (tickers: string[]): boolean => {
    if (!multipleQuoteQuery.isQuoteLoading) return false;
    return tickers.some(ticker => {
      const upperTicker = ticker.toUpperCase();
      if (!watchedTickers.includes(upperTicker)) return false;
      return multipleQuoteQuery.isQuoteLoading(ticker);
    });
  };

  const error = (ticker: string): Error | null => {
    if (!multipleQuoteQuery.data) return multipleQuoteQuery.error;

    const tickerData = multipleQuoteQuery.data.find(
      result => result.ticker === ticker.toUpperCase()
    );

    return tickerData?.error || null;
  };

  const watchTickers = useCallback((tickers: string[]) => {
    const upperTickers = tickers.map(t => t.toUpperCase());
    setWatchedTickers(prev => {
      const newTickers = upperTickers.filter(t => !prev.includes(t));
      return [...prev, ...newTickers];
    });
  }, []);

  const unwatchTickers = useCallback((tickers: string[]) => {
    const upperTickers = tickers.map(t => t.toUpperCase());
    setWatchedTickers(prev => prev.filter(t => !upperTickers.includes(t)));
  }, []);

  const value: TickerDataContextValue = {
    getQuoteData,
    isLoading,
    isTickerLoading,
    error,
    watchTickers,
    unwatchTickers,
    watchedTickers
  };

  return <TickerDataContext.Provider value={value}>{children}</TickerDataContext.Provider>;
}

export function useTickerPrice() {
  const context = useContext(TickerDataContext);
  if (context === undefined) {
    throw new Error('useTickerPrice must be used within a TickerDataProvider');
  }
  return context;
}

export function useTickerData(ticker: string) {
  const context = useTickerPrice();
  const { getQuoteData, isTickerLoading, error, watchTickers } = context;
  const companyQuery = useCompanyInformation(ticker);

  // Only watch the ticker if it's not already being watched by the provider
  useEffect(() => {
    if (ticker && !context.watchedTickers.includes(ticker.toUpperCase())) {
      watchTickers([ticker]);
    }
  }, [ticker, watchTickers, context.watchedTickers]);

  return {
    companyData: companyQuery.data || null,
    quoteData: getQuoteData(ticker),
    isLoading: companyQuery.isLoading || isTickerLoading([ticker]),
    error: companyQuery.error || error(ticker)
  };
}
