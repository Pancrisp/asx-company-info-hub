'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  ReactNode
} from 'react';
import { formatTicker } from '@/lib/api';
import { QuoteData } from '@/types/schema';
import { POPULAR_STOCKS } from '@/data/stocks';
import { useMultipleQuoteData, useCompanyInformation } from '@/hooks/useTickerData';

interface TickerDataContextValue {
  getQuoteData: (ticker: string) => QuoteData | null;
  isLoading: boolean;
  isTickerLoading: (tickers: string[]) => boolean;
  error: (ticker: string) => Error | null;
  watchTickers: (tickers: string[]) => void;
  unwatchTickers: (tickers: string[]) => void;
  watchedTickers: string[];
  cleanupTickers: () => void;
  setCurrentlyDisplayedTicker: (ticker: string | null) => void;
}

const TickerDataContext = createContext<TickerDataContextValue | undefined>(undefined);

interface TickerDataProviderProps {
  children: ReactNode;
}

const WATCHLIST_STORAGE_KEY = 'asx-watchlist';

export function TickerDataProvider({ children }: TickerDataProviderProps) {
  const tickerAccessTimesRef = useRef<Map<string, number>>(new Map());
  const [currentlyDisplayedTicker, setCurrentlyDisplayedTicker] = useState<string | null>(null);

  const [watchedTickers, setWatchedTickers] = useState<string[]>(() => {
    const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => formatTicker(stock.ticker));

    const watchlistedTickers: string[] = [];
    try {
      if (typeof window !== 'undefined') {
        const tickers = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (tickers) {
          const parsedTickers = JSON.parse(tickers);
          if (Array.isArray(parsedTickers)) {
            watchlistedTickers.push(...parsedTickers.map(t => formatTicker(t)));
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
      result => result.ticker === formatTicker(ticker)
    );

    return tickerData?.data || null;
  };

  const isLoading = multipleQuoteQuery.isLoading;

  const isTickerLoading = (tickers: string[]): boolean => {
    if (!multipleQuoteQuery.isQuoteLoading) return false;
    return tickers.some(ticker => {
      const formattedTicker = formatTicker(ticker);
      if (!watchedTickers.includes(formattedTicker)) return false;
      return multipleQuoteQuery.isQuoteLoading(ticker);
    });
  };

  const error = (ticker: string): Error | null => {
    if (!multipleQuoteQuery.data) return multipleQuoteQuery.error;

    const tickerData = multipleQuoteQuery.data.find(
      result => result.ticker === formatTicker(ticker)
    );

    return tickerData?.error || null;
  };

  const cleanupTickers = useCallback(() => {
    const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);

    let watchlistedTickers: string[] = [];
    try {
      if (typeof window !== 'undefined') {
        const tickers = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (tickers) {
          const parsedTickers = JSON.parse(tickers);
          if (Array.isArray(parsedTickers)) {
            watchlistedTickers = parsedTickers.map(t => formatTicker(t));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load watchlisted tickers from localStorage:', error);
    }

    const persistentTickers = [...trendingTickers, ...watchlistedTickers];
    const persistentTickersSet = new Set(persistentTickers.map(t => formatTicker(t)));
    const now = Date.now();
    const THREE_MINUTES = 3 * 60 * 1000;

    setWatchedTickers(prev => {
      return prev.filter(ticker => {
        const formattedTicker = formatTicker(ticker);

        if (persistentTickersSet.has(formattedTicker)) {
          return true;
        }
        if (currentlyDisplayedTicker === formattedTicker) {
          return true;
        }

        const lastAccess = tickerAccessTimesRef.current.get(formattedTicker);
        if (!lastAccess) {
          return false;
        }

        const isExpired = now - lastAccess > THREE_MINUTES;
        if (isExpired) {
          tickerAccessTimesRef.current.delete(formattedTicker);
          return false;
        }

        return true;
      });
    });
  }, [currentlyDisplayedTicker]);

  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        cleanupTickers();
      },
      3 * 60 * 1000
    );

    return () => clearInterval(cleanupInterval);
  }, [cleanupTickers]);

  const watchTickers = useCallback((tickers: string[]) => {
    const formattedTickers = tickers.map(t => formatTicker(t));

    formattedTickers.forEach(ticker => {
      tickerAccessTimesRef.current.set(ticker, Date.now());
    });

    setWatchedTickers(prev => {
      const newTickers = formattedTickers.filter(t => !prev.includes(t));
      if (newTickers.length === 0) return prev;

      return [...prev, ...newTickers];
    });
  }, []);

  const unwatchTickers = useCallback((tickers: string[]) => {
    const formattedTickers = tickers.map(t => formatTicker(t));
    setWatchedTickers(prev => prev.filter(t => !formattedTickers.includes(t)));
  }, []);

  const value: TickerDataContextValue = {
    getQuoteData,
    isLoading,
    isTickerLoading,
    error,
    watchTickers,
    unwatchTickers,
    watchedTickers,
    cleanupTickers,
    setCurrentlyDisplayedTicker
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

  useEffect(() => {
    if (ticker && !context.watchedTickers.includes(formatTicker(ticker))) {
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
