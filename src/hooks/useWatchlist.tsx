'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { QuoteData } from '@/types/schema';

const WATCHLIST_STORAGE_KEY = 'asx-watchlist';

interface WatchlistContextType {
  watchlist: string[];
  watchlistQuoteData: Map<string, QuoteData>;
  addToWatchlist: (ticker: string, quoteData?: QuoteData | null) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  toggleWatchlist: (ticker: string, quoteData?: QuoteData | null) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

interface WatchlistProviderProps {
  children: ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistQuoteData, setWatchlistQuoteData] = useState<Map<string, QuoteData>>(new Map());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load watchlist from localStorage:', error);
    }
  }, []);

  const saveToStorage = useCallback((newWatchlist: string[]) => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlist));
    } catch (error) {
      console.error('Failed to save watchlist to localStorage:', error);
    }
  }, []);

  const addToWatchlist = useCallback(
    (ticker: string, quoteData?: QuoteData | null) => {
      const newTicker = ticker.toUpperCase();
      setWatchlist(prev => {
        if (prev.includes(newTicker)) {
          return prev;
        }
        const newWatchlist = [...prev, newTicker];
        saveToStorage(newWatchlist);
        return newWatchlist;
      });

      if (quoteData) {
        setWatchlistQuoteData(prev => {
          const newData = new Map(prev);
          newData.set(newTicker, quoteData);
          return newData;
        });
      }
    },
    [saveToStorage]
  );

  const removeFromWatchlist = useCallback(
    (ticker: string) => {
      const newTicker = ticker.toUpperCase();
      setWatchlist(prev => {
        const newWatchlist = prev.filter(t => t !== newTicker);
        saveToStorage(newWatchlist);
        return newWatchlist;
      });

      setWatchlistQuoteData(prev => {
        const newData = new Map(prev);
        newData.delete(newTicker);
        return newData;
      });
    },
    [saveToStorage]
  );

  const isInWatchlist = useCallback(
    (ticker: string) => {
      return watchlist.includes(ticker.toUpperCase());
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (ticker: string, quoteData?: QuoteData | null) => {
      if (isInWatchlist(ticker)) {
        removeFromWatchlist(ticker);
      } else {
        addToWatchlist(ticker, quoteData);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  const value = {
    watchlist,
    watchlistQuoteData,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
