import { render, screen, fireEvent } from '@testing-library/react';
import { WatchlistProvider } from '@/hooks/useWatchlist';
import WatchlistTable from './WatchlistTable';

const mockGetQuoteData = jest.fn();
const mockIsTickerLoading = jest.fn();

jest.mock('@/contexts/TickerDataContext', () => ({
  useTickerPrice: () => ({
    getQuoteData: mockGetQuoteData,
    isTickerLoading: mockIsTickerLoading
  })
}));

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
  mockGetQuoteData.mockClear();
  mockIsTickerLoading.mockClear();
});

afterEach(() => {
  console.error = originalConsoleError;
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(<WatchlistProvider>{component}</WatchlistProvider>);
};

const mockQuoteData = {
  cf_last: 85.5,
  cf_netchng: 2.3,
  pctchng: 2.76,
  yrlow: 75.0,
  yrhigh: 95.0,
  mkt_value: 150000000000,
  cf_volume: 2500000,
  peratio: 18.5
};

describe('WatchlistTable', () => {
  describe('empty state', () => {
    it('shows empty state when watchlist is empty', () => {
      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
      expect(screen.getByText(/Add stocks by clicking the.*icon/)).toBeInTheDocument();

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Ticker')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Change')).toBeInTheDocument();
      expect(screen.getByText('52W Range')).toBeInTheDocument();
      expect(screen.getByText('Mkt Cap')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('P/E')).toBeInTheDocument();
    });

    it('does not show empty state when localStorage has tickers', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      mockIsTickerLoading.mockReturnValue(false);
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable />);

      expect(screen.queryByText('Your watchlist is empty')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading skeleton when watchlist is loading', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      mockIsTickerLoading.mockReturnValue(true);

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('Watchlist')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();

      expect(screen.queryByText('CBA')).not.toBeInTheDocument();
      expect(screen.queryByText('BHP')).not.toBeInTheDocument();
      expect(screen.queryByText(/\$\d+\.\d+/)).not.toBeInTheDocument();
    });

    it('does not show loading state when not loading', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      mockIsTickerLoading.mockReturnValue(false);
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('CBA')).toBeInTheDocument();
      expect(screen.getByText('$85.50')).toBeInTheDocument();
    });
  });

  describe('populated watchlist', () => {
    beforeEach(() => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA', 'BHP']));
      mockIsTickerLoading.mockReturnValue(false);
    });

    it('displays watchlist data when available', () => {
      mockGetQuoteData.mockImplementation((ticker: string) => {
        if (ticker === 'CBA') return mockQuoteData;
        if (ticker === 'BHP') return { ...mockQuoteData, cf_last: 45.2 };
        return null;
      });

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('CBA')).toBeInTheDocument();
      expect(screen.getByText('BHP')).toBeInTheDocument();
      expect(screen.getByText('$85.50')).toBeInTheDocument();
      expect(screen.getByText('$45.20')).toBeInTheDocument();
    });

    it('handles mixed data availability', () => {
      mockGetQuoteData.mockImplementation((ticker: string) => {
        if (ticker === 'CBA') return mockQuoteData;
        if (ticker === 'BHP') return null;
        return null;
      });

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('CBA')).toBeInTheDocument();
      expect(screen.getByText('$85.50')).toBeInTheDocument();

      expect(screen.queryByText('BHP')).not.toBeInTheDocument();
      expect(screen.getByText(/Some watchlist items failed to load/)).toBeInTheDocument();
    });

    it('shows error message when some items fail to load', () => {
      mockGetQuoteData.mockImplementation((ticker: string) => {
        if (ticker === 'CBA') return mockQuoteData;
        return null;
      });

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText(/Some watchlist items failed to load/)).toBeInTheDocument();
      expect(
        screen.getByText(/They may have been delisted or have invalid tickers/)
      ).toBeInTheDocument();
    });

    it('does not show error message when all items load successfully', () => {
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable />);

      expect(screen.queryByText(/Some watchlist items failed to load/)).not.toBeInTheDocument();
    });

    it('visually distinguishes positive and negative price changes', () => {
      mockGetQuoteData.mockImplementation((ticker: string) => {
        if (ticker === 'CBA') return { ...mockQuoteData, cf_netchng: 2.3, pctchng: 2.76 };
        if (ticker === 'BHP') return { ...mockQuoteData, cf_netchng: -1.5, pctchng: -1.85 };
        return null;
      });

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByTestId('price-change-positive')).toBeInTheDocument();
      expect(screen.getByTestId('price-change-negative')).toBeInTheDocument();

      expect(screen.getByTestId('price-change-positive')).toHaveAttribute('data-change-direction', 'positive');
      expect(screen.getByTestId('price-change-negative')).toHaveAttribute('data-change-direction', 'negative');
    });

    it('calls onTickerSelect when row is clicked', () => {
      const mockOnTickerSelect = jest.fn();
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable onTickerSelect={mockOnTickerSelect} />);

      const row = screen.getByText('CBA').closest('tr');
      fireEvent.click(row!);

      expect(mockOnTickerSelect).toHaveBeenCalledWith('CBA');
    });

    it('calls onTickerSelect when Enter key is pressed on row', () => {
      const mockOnTickerSelect = jest.fn();
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable onTickerSelect={mockOnTickerSelect} />);

      const row = screen.getByText('CBA').closest('tr');
      fireEvent.keyDown(row!, { key: 'Enter' });

      expect(mockOnTickerSelect).toHaveBeenCalledWith('CBA');
    });

    it('removes ticker when trash button is clicked', () => {
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable />);

      const removeButtons = screen.getAllByLabelText(/Remove .* from watchlist/);
      fireEvent.click(removeButtons[0]);

      const updatedWatchlist = JSON.parse(localStorage.getItem('asx-watchlist') || '[]');
      expect(updatedWatchlist).not.toContain('CBA');
    });

    it('prevents row click when trash button is clicked', () => {
      const mockOnTickerSelect = jest.fn();
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable onTickerSelect={mockOnTickerSelect} />);

      const removeButtons = screen.getAllByLabelText(/Remove .* from watchlist/);
      fireEvent.click(removeButtons[0]);

      expect(mockOnTickerSelect).not.toHaveBeenCalled();
    });

    it('handles zero price change correctly', () => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      mockGetQuoteData.mockReturnValue({
        ...mockQuoteData,
        cf_netchng: 0,
        pctchng: 0
      });

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByTestId('price-change-neutral')).toBeInTheDocument();
      expect(screen.getByTestId('price-change-neutral')).toHaveAttribute('data-change-direction', 'neutral');
      expect(screen.getByText('+0.00%')).toBeInTheDocument();
    });
  });

  describe('data formatting and display', () => {
    beforeEach(() => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      mockIsTickerLoading.mockReturnValue(false);
    });

    it('formats currency values correctly', () => {
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('$85.50')).toBeInTheDocument();
    });

    it('formats large numbers with appropriate suffixes', () => {
      mockGetQuoteData.mockReturnValue({
        ...mockQuoteData,
        mkt_value: 150000000000,
        cf_volume: 2500000
      });

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('$150.00B')).toBeInTheDocument();
      expect(screen.getByText('2.5M')).toBeInTheDocument();
    });

    it('displays P/E ratio as decimal', () => {
      mockGetQuoteData.mockReturnValue(mockQuoteData);

      renderWithProvider(<WatchlistTable />);

      expect(screen.getByText('18.50')).toBeInTheDocument();
    });

    it('renders 52-week range visualization', () => {
      mockGetQuoteData.mockReturnValue(mockQuoteData);
      const { container } = renderWithProvider(<WatchlistTable />);

      const rangeBar = container.querySelector('[title*="52w range"]');
      expect(rangeBar).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      localStorage.setItem('asx-watchlist', JSON.stringify(['CBA']));
      mockIsTickerLoading.mockReturnValue(false);
      mockGetQuoteData.mockReturnValue(mockQuoteData);
    });

    it('supports keyboard navigation for remove button', () => {
      renderWithProvider(<WatchlistTable />);

      const removeButton = screen.getByLabelText(/Remove CBA from watchlist/);
      fireEvent.keyDown(removeButton, { key: 'Enter' });

      const updatedWatchlist = JSON.parse(localStorage.getItem('asx-watchlist') || '[]');
      expect(updatedWatchlist).not.toContain('CBA');
    });

    it('has proper accessibility attributes', () => {
      renderWithProvider(<WatchlistTable />);

      const row = screen.getByText('CBA').closest('tr');
      expect(row).toHaveAttribute('role', 'button');
      expect(row).toHaveAttribute('tabIndex', '0');
      expect(row).toHaveAttribute('aria-label', 'View details for CBA');
    });
  });
});
