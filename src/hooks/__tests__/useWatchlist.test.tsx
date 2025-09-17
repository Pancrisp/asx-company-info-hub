import { renderHook, act } from '@testing-library/react';
import { WatchlistProvider, useWatchlist } from '../useWatchlist';

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
  localStorage.clear();
});

afterEach(() => {
  console.error = originalConsoleError;
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WatchlistProvider>{children}</WatchlistProvider>
);

describe('useWatchlist', () => {
  describe('context provider', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useWatchlist());
      }).toThrow('useWatchlist must be used within a WatchlistProvider');
    });
  });

  describe('localStorage initialization', () => {
    it('initializes with empty watchlist when localStorage is empty', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.watchlist).toEqual([]);
    });

    it('loads existing watchlist from localStorage', () => {
      const existingWatchlist = ['CBA', 'BHP', 'CSL'];
      localStorage.setItem('asx-watchlist', JSON.stringify(existingWatchlist));

      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.watchlist).toEqual(existingWatchlist);
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('asx-watchlist', 'invalid-json');

      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.watchlist).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load watchlist from localStorage:',
        expect.any(Error)
      );
    });

    it('handles non-array data in localStorage', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify('not-an-array'));

      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.watchlist).toEqual([]);
    });

    it('handles null data in localStorage', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(null));

      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.watchlist).toEqual([]);
    });
  });

  describe('addToWatchlist', () => {
    it('adds ticker to empty watchlist', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.addToWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
      expect(localStorage.getItem('asx-watchlist')).toBe('["CBA"]');
    });

    it('adds ticker to existing watchlist', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.addToWatchlist('BHP');
      });

      expect(result.current.watchlist).toEqual(['CBA', 'BHP']);
      expect(localStorage.getItem('asx-watchlist')).toBe('["CBA","BHP"]');
    });

    it('converts ticker to uppercase', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.addToWatchlist('cba');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
    });

    it('does not add duplicate tickers', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.addToWatchlist('CBA');
      });

      act(() => {
        result.current.addToWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
    });

    it('does not add duplicate tickers with different cases', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.addToWatchlist('CBA');
      });

      act(() => {
        result.current.addToWatchlist('cba');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
    });

    it('handles localStorage save errors gracefully', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      act(() => {
        result.current.addToWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save watchlist to localStorage:',
        expect.any(Error)
      );

      localStorage.setItem = originalSetItem;
    });
  });

  describe('removeFromWatchlist', () => {
    it('removes ticker from watchlist', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.removeFromWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual(['BHP']);
      expect(localStorage.getItem('asx-watchlist')).toBe('["BHP"]');
    });

    it('handles case insensitive removal', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.removeFromWatchlist('cba');
      });

      expect(result.current.watchlist).toEqual(['BHP']);
    });

    it('handles removing non-existent ticker', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.removeFromWatchlist('BHP');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
    });

    it('clears watchlist when removing last ticker', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.removeFromWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual([]);
      expect(localStorage.getItem('asx-watchlist')).toBe('[]');
    });
  });

  describe('isInWatchlist', () => {
    it('returns true for ticker in watchlist', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.isInWatchlist('CBA')).toBe(true);
    });

    it('returns false for ticker not in watchlist', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.isInWatchlist('CSL')).toBe(false);
    });

    it('handles case insensitive check', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.isInWatchlist('cba')).toBe(true);
      expect(result.current.isInWatchlist('bhp')).toBe(true);
    });

    it('returns false for empty watchlist', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      expect(result.current.isInWatchlist('CBA')).toBe(false);
    });
  });

  describe('toggleWatchlist', () => {
    it('adds ticker when not in watchlist', () => {
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.toggleWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual(['CBA']);
    });

    it('removes ticker when already in watchlist', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.toggleWatchlist('CBA');
      });

      expect(result.current.watchlist).toEqual(['BHP']);
    });

    it('handles case insensitive toggle', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      const { result } = renderHook(() => useWatchlist(), { wrapper });

      act(() => {
        result.current.toggleWatchlist('cba');
      });

      expect(result.current.watchlist).toEqual([]);
    });
  });
});