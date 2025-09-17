import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TickerDataProvider, useTickerPrice, useTickerData } from './TickerDataContext';
import { POPULAR_STOCKS } from '@/data/stocks';
import * as useTickerDataModule from '@/hooks/useTickerData';

jest.mock('@/hooks/useTickerData');

const mockUseMultipleQuoteData = jest.fn();
const mockUseCompanyInformation = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  (useTickerDataModule.useMultipleQuoteData as jest.Mock) = mockUseMultipleQuoteData;
  (useTickerDataModule.useCompanyInformation as jest.Mock) = mockUseCompanyInformation;

  mockUseMultipleQuoteData.mockReturnValue({
    data: [],
    isLoading: false,
    isQuoteLoading: jest.fn().mockReturnValue(false),
    error: null
  });

  mockUseCompanyInformation.mockReturnValue({
    data: null,
    isLoading: false,
    error: null
  });
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TickerDataProvider>{children}</TickerDataProvider>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('TickerDataContext', () => {
  describe('Provider initialization', () => {
    it('should initialize with trending stocks', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      expect(result.current.watchedTickers).toEqual(trendingTickers);
    });

    it('should load tickers from localStorage on init', () => {
      const storedTickers = ['TST', 'DEMO'];
      localStorage.setItem('asx-watchlist', JSON.stringify(storedTickers));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      const expectedTickers = [...trendingTickers, ...storedTickers];

      expect(result.current.watchedTickers).toEqual(expect.arrayContaining(expectedTickers));
      expect(result.current.watchedTickers).toHaveLength(expectedTickers.length);
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('asx-watchlist', 'invalid-json');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      expect(result.current.watchedTickers).toEqual(trendingTickers);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load watchlisted tickers from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle non-array localStorage data', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify({ not: 'array' }));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      expect(result.current.watchedTickers).toEqual(trendingTickers);
    });

    it('should remove duplicates when combining trending and stored tickers', () => {
      const storedTickers = ['CBA', 'TST'];
      localStorage.setItem('asx-watchlist', JSON.stringify(storedTickers));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      const expectedTickers = [...trendingTickers, 'TST'];

      expect(result.current.watchedTickers).toEqual(expectedTickers);
      expect(result.current.watchedTickers.filter(t => t === 'CBA')).toHaveLength(1);
    });
  });

  describe('watchTickers functionality', () => {
    it('should add new tickers to watchlist', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        result.current.watchTickers(['TEST1', 'TEST2']);
      });

      expect(result.current.watchedTickers).toContain('TEST1');
      expect(result.current.watchedTickers).toContain('TEST2');
    });

    it('should convert tickers to uppercase', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        result.current.watchTickers(['test1', 'test2']);
      });

      expect(result.current.watchedTickers).toContain('TEST1');
      expect(result.current.watchedTickers).toContain('TEST2');
      expect(result.current.watchedTickers).not.toContain('test1');
      expect(result.current.watchedTickers).not.toContain('test2');
    });

    it('should not add duplicate tickers', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        result.current.watchTickers(['TEST']);
      });

      const initialLength = result.current.watchedTickers.length;

      act(() => {
        result.current.watchTickers(['TEST']);
      });

      expect(result.current.watchedTickers).toHaveLength(initialLength);
      expect(result.current.watchedTickers.filter(t => t === 'TEST')).toHaveLength(1);
    });

    it('should handle empty array input', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const initialTickers = [...result.current.watchedTickers];

      act(() => {
        result.current.watchTickers([]);
      });

      expect(result.current.watchedTickers).toEqual(initialTickers);
    });
  });

  describe('unwatchTickers functionality', () => {
    it('should remove tickers from watchlist', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        result.current.watchTickers(['TEST1', 'TEST2']);
      });

      act(() => {
        result.current.unwatchTickers(['TEST1']);
      });

      expect(result.current.watchedTickers).not.toContain('TEST1');
      expect(result.current.watchedTickers).toContain('TEST2');
    });

    it('should convert tickers to uppercase when removing', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        result.current.watchTickers(['TEST']);
      });

      act(() => {
        result.current.unwatchTickers(['test']);
      });

      expect(result.current.watchedTickers).not.toContain('TEST');
    });

    it('should handle removing non-existent tickers gracefully', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const initialTickers = [...result.current.watchedTickers];

      act(() => {
        result.current.unwatchTickers(['NONEXISTENT']);
      });

      expect(result.current.watchedTickers).toEqual(initialTickers);
    });

    it('should handle empty array input', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const initialTickers = [...result.current.watchedTickers];

      act(() => {
        result.current.unwatchTickers([]);
      });

      expect(result.current.watchedTickers).toEqual(initialTickers);
    });
  });

  describe('getQuoteData functionality', () => {
    it('should return null when no data available', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const quoteData = result.current.getQuoteData('CBA');
      expect(quoteData).toBeNull();
    });

    it('should return quote data for existing ticker', () => {
      const mockQuoteData = {
        cf_last: 120.5,
        mkt_value: 180000000000,
        cf_open: 119.8,
        cf_low: 119.2,
        cf_high: 121.0,
        cf_close: 120.0,
        cf_volume: 1500000,
        cf_netchng: 0.5,
        pctchng: 0.42,
        yrhigh: 125.0,
        yrlow: 95.0,
        peratio: 15.2,
        earnings: 7.95
      };

      mockUseMultipleQuoteData.mockReturnValue({
        data: [{ ticker: 'CBA', data: mockQuoteData, error: null }],
        isLoading: false,
        isQuoteLoading: jest.fn().mockReturnValue(false),
        error: null
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const quoteData = result.current.getQuoteData('CBA');
      expect(quoteData).toEqual(mockQuoteData);
    });

    it('should handle case-insensitive ticker lookup', () => {
      const mockQuoteData = {
        cf_last: 120.5,
        mkt_value: 180000000000,
        cf_open: 119.8,
        cf_low: 119.2,
        cf_high: 121.0,
        cf_close: 120.0,
        cf_volume: 1500000,
        cf_netchng: 0.5,
        pctchng: 0.42,
        yrhigh: 125.0,
        yrlow: 95.0,
        peratio: 15.2,
        earnings: 7.95
      };

      mockUseMultipleQuoteData.mockReturnValue({
        data: [{ ticker: 'CBA', data: mockQuoteData, error: null }],
        isLoading: false,
        isQuoteLoading: jest.fn().mockReturnValue(false),
        error: null
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const quoteData = result.current.getQuoteData('cba');
      expect(quoteData).toEqual(mockQuoteData);
    });
  });

  describe('loading states', () => {
    it('should return global loading state', () => {
      mockUseMultipleQuoteData.mockReturnValue({
        data: [],
        isLoading: true,
        isQuoteLoading: jest.fn().mockReturnValue(false),
        error: null
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return ticker-specific loading state', () => {
      const mockIsQuoteLoading = jest.fn(ticker => ticker === 'CBA');

      mockUseMultipleQuoteData.mockReturnValue({
        data: [],
        isLoading: false,
        isQuoteLoading: mockIsQuoteLoading,
        error: null
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      expect(result.current.isTickerLoading(['CBA'])).toBe(true);
      expect(result.current.isTickerLoading(['WBC'])).toBe(false);
    });

    it('should handle loading state for unwatched tickers', () => {
      const mockIsQuoteLoading = jest.fn().mockReturnValue(true);

      mockUseMultipleQuoteData.mockReturnValue({
        data: [],
        isLoading: false,
        isQuoteLoading: mockIsQuoteLoading,
        error: null
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      expect(result.current.isTickerLoading(['UNWATCHED'])).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return global error when no data', () => {
      const mockError = new Error('Network error');

      mockUseMultipleQuoteData.mockReturnValue({
        data: null,
        isLoading: false,
        isQuoteLoading: jest.fn().mockReturnValue(false),
        error: mockError
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      expect(result.current.error('CBA')).toBe(mockError);
    });

    it('should return ticker-specific error', () => {
      const mockError = new Error('Ticker not found');

      mockUseMultipleQuoteData.mockReturnValue({
        data: [{ ticker: 'CBA', data: null, error: mockError }],
        isLoading: false,
        isQuoteLoading: jest.fn().mockReturnValue(false),
        error: null
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      expect(result.current.error('CBA')).toBe(mockError);
    });
  });

  describe('useTickerData hook', () => {
    it('should automatically watch ticker when used', async () => {
      const Wrapper = createWrapper();

      renderHook(() => useTickerData('TEST'), { wrapper: Wrapper });

      await waitFor(() => {
        expect(mockUseMultipleQuoteData).toHaveBeenCalledWith(expect.arrayContaining(['TEST']));
      });
    });

    it('should not watch ticker if already being watched', async () => {
      const Wrapper = createWrapper();

      const { result: contextResult } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        contextResult.current.watchTickers(['TEST']);
      });

      renderHook(() => useTickerData('TEST'), { wrapper: Wrapper });

      await waitFor(() => {
        expect(contextResult.current.watchedTickers.filter(t => t === 'TEST')).toHaveLength(1);
      });
    });
  });

  describe('context error handling', () => {
    it('should throw error when useTickerPrice used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTickerPrice());
      }).toThrow('useTickerPrice must be used within a TickerDataProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('integration with React Query', () => {
    it('should call useMultipleQuoteData with watched tickers', () => {
      const Wrapper = createWrapper();
      renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      expect(mockUseMultipleQuoteData).toHaveBeenCalledWith(trendingTickers);
    });

    it('should update React Query when tickers are added', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTickerPrice(), { wrapper: Wrapper });

      act(() => {
        result.current.watchTickers(['TEST']);
      });

      const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
      const expectedTickers = [...trendingTickers, 'TEST'];

      expect(mockUseMultipleQuoteData).toHaveBeenLastCalledWith(expectedTickers);
    });
  });
});
