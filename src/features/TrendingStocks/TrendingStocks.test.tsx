import { render, screen, fireEvent } from '@testing-library/react';
import TrendingStocks from './TrendingStocks';
import { POPULAR_STOCKS } from '@/data/stocks';

const mockGetQuoteData = jest.fn();
const mockIsTickerLoading = jest.fn();
const mockError = jest.fn();

jest.mock('@/contexts/TickerDataContext', () => ({
  useTickerPrice: () => ({
    getQuoteData: mockGetQuoteData,
    isTickerLoading: mockIsTickerLoading,
    error: mockError
  })
}));

describe('TrendingStocks', () => {
  const mockOnStockSelect = jest.fn();
  const expectedTickers = POPULAR_STOCKS.slice(0, 6);

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTickerLoading.mockReturnValue(false);
    mockGetQuoteData.mockReturnValue({
      cf_last: 85.5,
      cf_netchng: 2.3,
      pctchng: 2.76
    });
    mockError.mockReturnValue(null);
  });

  describe('data display', () => {
    it('displays first 6 trending stocks from POPULAR_STOCKS', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const stockItems = screen.getAllByTestId('stock-item');
      expect(stockItems).toHaveLength(6);

      expectedTickers.forEach((stock, index) => {
        const stockItems = screen.getAllByTestId('stock-item');
        const stockItem = stockItems[index];
        expect(stockItem).toHaveAttribute('data-ticker', stock.ticker);

        const nameElements = screen.getAllByText(stock.name);
        expect(nameElements.length).toBeGreaterThan(0);
      });
    });

    it('shows "Trending stocks" header', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      expect(screen.getByText('Trending stocks')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Trending stocks');
    });

    it('renders trending stocks container with proper attributes', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const container = screen.getByTestId('trending-stocks-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', 'A list of trending stocks');
    });
  });

  describe('loading states', () => {
    it('passes loading state to all stock items when tickers are loading', () => {
      mockIsTickerLoading.mockReturnValue(true);
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const loadingItems = screen.getAllByTestId('stock-item');
      loadingItems.forEach(item => {
        expect(item).toHaveAttribute('data-loading', 'true');
      });
    });

    it('shows normal state when loading is complete', () => {
      mockIsTickerLoading.mockReturnValue(false);
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const stockItems = screen.getAllByTestId('stock-item');
      stockItems.forEach(item => {
        expect(item).not.toHaveAttribute('data-loading', 'true');
        expect(item).toHaveAttribute('data-interactive', 'true');
      });
    });
  });

  describe('user interactions', () => {
    it('calls onStockSelect with correct ticker when stock is clicked', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      expectedTickers.forEach((stock, index) => {
        const stockItem = screen.getAllByTestId('stock-item')[index];
        fireEvent.click(stockItem);

        expect(mockOnStockSelect).toHaveBeenCalledWith(stock.ticker);
      });

      expect(mockOnStockSelect).toHaveBeenCalledTimes(6);
    });

    it('passes each ticker correctly to stock items', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      expectedTickers.forEach((stock, index) => {
        const stockItem = screen.getAllByTestId('stock-item')[index];
        expect(stockItem).toHaveAttribute('data-ticker', stock.ticker);
      });
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for screen readers', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const container = screen.getByTestId('trending-stocks-container');
      expect(container).toHaveAttribute('aria-label', 'A list of trending stocks');
    });

    it('maintains proper semantic structure', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();

      const listContainer = screen.getByRole('complementary');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('data integration', () => {
    it('requests loading state for correct tickers', () => {
      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      const expectedTickersList = expectedTickers.map(stock => stock.ticker);
      expect(mockIsTickerLoading).toHaveBeenCalledWith(expectedTickersList);
    });

    it('handles missing stock data gracefully', () => {
      const originalSlice = POPULAR_STOCKS.slice;
      POPULAR_STOCKS.slice = jest
        .fn()
        .mockReturnValue(
          [
            { ticker: 'CBA', name: 'Commonwealth Bank of Australia' },
            null,
            { ticker: 'NAB', name: 'National Australia Bank' }
          ].filter(Boolean)
        );

      render(<TrendingStocks onStockSelect={mockOnStockSelect} />);

      expect(screen.getByText('Trending stocks')).toBeInTheDocument();

      POPULAR_STOCKS.slice = originalSlice;
    });
  });
});
