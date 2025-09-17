import { render, screen, fireEvent } from '@testing-library/react';
import StockItem from './StockItem';

const mockGetQuoteData = jest.fn();
const mockError = jest.fn();

jest.mock('@/contexts/TickerDataContext', () => ({
  useTickerPrice: () => ({
    getQuoteData: mockGetQuoteData,
    error: mockError
  })
}));

describe('StockItem', () => {
  const defaultProps = {
    ticker: 'CBA',
    name: 'Commonwealth Bank of Australia',
    isLoading: false,
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockError.mockReturnValue(null);
  });

  describe('loading state', () => {
    it('shows skeleton placeholders', () => {
      mockGetQuoteData.mockReturnValue(null);
      render(<StockItem {...defaultProps} isLoading={true} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-loading', 'true');
      expect(stockItem).toHaveAttribute('data-ticker', 'CBA');

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();

      const skeletonElements = screen.getAllByRole('generic');
      const skeletons = skeletonElements.filter(
        el => el.className.includes('animate-pulse') && el.className.includes('bg-gray-200')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays ticker and company name', () => {
      render(<StockItem {...defaultProps} isLoading={true} />);

      expect(screen.getByText('CBA')).toBeInTheDocument();
      expect(screen.getByText('Commonwealth Bank of Australia')).toBeInTheDocument();
    });

    it('does not render as interactive button', () => {
      render(<StockItem {...defaultProps} isLoading={true} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem.tagName).toBe('DIV');
      expect(stockItem).not.toHaveAttribute('data-interactive');
    });
  });

  describe('error state', () => {
    it('shows fallback UI when ticker data fails to load', () => {
      mockGetQuoteData.mockReturnValue(null);
      mockError.mockReturnValue(new Error('API Error'));

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-error', 'true');
      expect(stockItem).toHaveAttribute('data-ticker', 'CBA');

      expect(screen.getByText('--')).toBeInTheDocument();

      expect(stockItem).toHaveClass('opacity-50');
    });

    it('displays ticker and company name', () => {
      mockGetQuoteData.mockReturnValue(null);
      mockError.mockReturnValue(new Error('API Error'));

      render(<StockItem {...defaultProps} />);

      expect(screen.getByText('CBA')).toBeInTheDocument();
      expect(screen.getByText('Commonwealth Bank of Australia')).toBeInTheDocument();
    });

    it('does not render as interactive button', () => {
      mockGetQuoteData.mockReturnValue(null);
      mockError.mockReturnValue(new Error('API Error'));

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem.tagName).toBe('DIV');
      expect(stockItem).not.toHaveAttribute('data-interactive');
    });
  });

  describe('normal state', () => {
    it('displays formatted price and company information', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} />);

      expect(screen.getByText('CBA')).toBeInTheDocument();
      expect(screen.getByText('Commonwealth Bank of Australia')).toBeInTheDocument();
      expect(screen.getByText('$85.50')).toBeInTheDocument();
      expect(screen.getByText('+2.76%')).toBeInTheDocument();
    });

    it('renders as interactive button', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem.tagName).toBe('BUTTON');
      expect(stockItem).toHaveAttribute('data-interactive', 'true');
    });
  });

  describe('price change visualization', () => {
    it('visually distinguishes positive price changes', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-price-direction', 'positive');

      expect(screen.getByText('+2.76%')).toBeInTheDocument();
    });

    it('visually distinguishes negative price changes', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 83.2,
        cf_netchng: -1.85,
        pctchng: -2.18
      });

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-price-direction', 'negative');

      expect(screen.getByText('-2.18%')).toBeInTheDocument();
    });

    it('handles neutral/zero price changes correctly', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 0,
        pctchng: 0
      });

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-price-direction', 'neutral');

      expect(screen.getByText('+0.00%')).toBeInTheDocument();
    });

    it('handles missing price data gracefully', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5
      });

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-price-direction', 'neutral');

      expect(screen.getByText('$85.50')).toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

    it('handles completely missing quote data', () => {
      mockGetQuoteData.mockReturnValue(null);

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');
      expect(stockItem).toHaveAttribute('data-price-direction', 'neutral');

      expect(screen.getByText('--')).toBeInTheDocument();
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe('data formatting', () => {
    it('formats currency values correctly', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} />);

      expect(screen.getByText('$85.50')).toBeInTheDocument();
    });

    it('formats percentage changes correctly', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 83.2,
        cf_netchng: -1.85,
        pctchng: -2.18
      });

      render(<StockItem {...defaultProps} />);

      expect(screen.getByText('-2.18%')).toBeInTheDocument();
    });

    it('handles decimal precision correctly', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.567,
        cf_netchng: 2.333,
        pctchng: 2.765
      });

      render(<StockItem {...defaultProps} />);

      expect(screen.getByText('$85.57')).toBeInTheDocument();
      expect(screen.getByText('+2.77%')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onClick when stock item is clicked', () => {
      const mockOnClick = jest.fn();
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} onClick={mockOnClick} />);

      const stockItem = screen.getByTestId('stock-item');
      fireEvent.click(stockItem);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation', () => {
      const mockOnClick = jest.fn();
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} onClick={mockOnClick} />);

      const stockItem = screen.getByTestId('stock-item');

      expect(stockItem.tagName).toBe('BUTTON');
      expect(stockItem).toHaveAttribute('data-interactive', 'true');

      fireEvent.click(stockItem);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('has proper focus management', () => {
      mockGetQuoteData.mockReturnValue({
        cf_last: 85.5,
        cf_netchng: 2.3,
        pctchng: 2.76
      });

      render(<StockItem {...defaultProps} />);

      const stockItem = screen.getByTestId('stock-item');

      expect(stockItem.tagName).toBe('BUTTON');

      stockItem.focus();
      expect(document.activeElement).toBe(stockItem);
    });

    it('does not call onClick when in loading state', () => {
      const mockOnClick = jest.fn();
      render(<StockItem {...defaultProps} isLoading={true} onClick={mockOnClick} />);

      const stockItem = screen.getByTestId('stock-item');
      fireEvent.click(stockItem);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when in error state', () => {
      const mockOnClick = jest.fn();
      mockGetQuoteData.mockReturnValue(null);
      mockError.mockReturnValue(new Error('API Error'));

      render(<StockItem {...defaultProps} onClick={mockOnClick} />);

      const stockItem = screen.getByTestId('stock-item');
      fireEvent.click(stockItem);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });
});
