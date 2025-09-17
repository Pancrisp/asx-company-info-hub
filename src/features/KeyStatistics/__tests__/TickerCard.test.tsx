import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TickerCard from '../TickerCard';
import { mockQuoteData, mockNegativeQuoteData, mockZeroChangeQuoteData, mockCompanyData } from './testUtils';
import { CompanyData } from '@/types/schema';

const mockToggleWatchlist = jest.fn();
const mockIsInWatchlist = jest.fn();

jest.mock('@/hooks/useWatchlist', () => ({
  useWatchlist: () => ({
    isInWatchlist: mockIsInWatchlist,
    toggleWatchlist: mockToggleWatchlist
  })
}));

jest.mock('../RangeBar', () => {
  return function MockRangeBar({ title, openPrice, highPrice, lowPrice, currentPrice }: { title: string; openPrice: number; highPrice: number; lowPrice: number; currentPrice: number }) {
    return (
      <div data-testid={`range-bar-${title}`}>
        Range: {lowPrice}-{highPrice}, Current: {currentPrice}, Open: {openPrice}
      </div>
    );
  };
});

jest.mock('../TickerMetrics', () => {
  return function MockTickerMetrics({ label, value, formatter }: { label: string; value: number; formatter: (value: number) => string }) {
    return (
      <div data-testid={`metric-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        {label}: {formatter(value)}
      </div>
    );
  };
});

jest.mock('../CompanyInfo', () => {
  return function MockCompanyInfo({ companyData }: { companyData: CompanyData | null }) {
    return companyData ? (
      <div data-testid="company-info">Company: {companyData.ticker}</div>
    ) : null;
  };
});

describe('TickerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInWatchlist.mockImplementation((ticker) => ticker === 'CBA');
  });

  describe('loading state', () => {
    it('should show loading skeleton when loading is true', () => {
      render(
        <TickerCard
          quoteData={null}
          loading={true}
          companyData={null}
        />
      );

      expect(screen.queryByText('CBA')).not.toBeInTheDocument();
      expect(screen.queryByText(/\$\d+\.\d+/)).not.toBeInTheDocument();
      expect(screen.getByLabelText('Card for ticker data')).toBeInTheDocument();
    });

    it('should not show actual data during loading', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={true}
          companyData={mockCompanyData}
        />
      );

      expect(screen.queryByText('CBA')).not.toBeInTheDocument();
      expect(screen.queryByText('$120.50')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty state when showEmptyState is true', () => {
      render(
        <TickerCard
          quoteData={null}
          loading={false}
          companyData={null}
          showEmptyState={true}
        />
      );

      expect(screen.getByText(/Choose a stock from the trending list/)).toBeInTheDocument();
      expect(screen.getByText(/press/)).toBeInTheDocument();
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('should show empty state when no quote data is provided', () => {
      render(
        <TickerCard
          quoteData={null}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByText(/Choose a stock from the trending list/)).toBeInTheDocument();
    });

    it('should show keyboard shortcut instruction', () => {
      render(
        <TickerCard
          quoteData={null}
          loading={false}
          companyData={null}
          showEmptyState={true}
        />
      );

      const shortcutKey = screen.getByText('/');
      expect(shortcutKey.closest('kbd')).toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('should display ticker symbol', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByText('CBA')).toBeInTheDocument();
    });

    it('should display formatted current price', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByText('$120.50')).toBeInTheDocument();
    });

    it('should display price change with correct formatting', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByText('$0.50')).toBeInTheDocument();
      expect(screen.getByText('+0.42%')).toBeInTheDocument();
    });

    it('should display negative price change correctly', () => {
      render(
        <TickerCard
          quoteData={mockNegativeQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByText('-$0.75')).toBeInTheDocument();
      expect(screen.getByText('-0.62%')).toBeInTheDocument();
    });
  });

  describe('visual differentiation', () => {
    it('should apply different visual styling for positive and negative changes', () => {
      const { rerender } = render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const positiveElement = screen.getByText('$0.50').parentElement;
      expect(positiveElement).toHaveClass('bg-green-100');

      rerender(
        <TickerCard
          quoteData={mockNegativeQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const negativeElement = screen.getByText('-$0.75').parentElement;
      expect(negativeElement).toHaveClass('bg-red-100');
    });

    it('should show neutral styling for zero change', () => {
      render(
        <TickerCard
          quoteData={mockZeroChangeQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const zeroElement = screen.getByText('$0.00').parentElement;
      expect(zeroElement).toBeInTheDocument();
    });
  });

  describe('watchlist functionality', () => {
    it('should show filled bookmark when ticker is in watchlist', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const bookmarkButton = screen.getByLabelText('Remove from watchlist');
      expect(bookmarkButton).toBeInTheDocument();
    });

    it('should show empty bookmark when ticker is not in watchlist', () => {
      const notInWatchlistData = { ...mockCompanyData, ticker: 'WBC' };

      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={notInWatchlistData}
        />
      );

      const bookmarkButton = screen.getByLabelText('Add to watchlist');
      expect(bookmarkButton).toBeInTheDocument();
    });

    it('should call toggleWatchlist when bookmark is clicked', () => {
      mockIsInWatchlist.mockReturnValue(false);

      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const bookmarkButton = screen.getByLabelText('Add to watchlist');
      fireEvent.click(bookmarkButton);

      expect(mockToggleWatchlist).toHaveBeenCalledWith('CBA');
    });
  });

  describe('component integration', () => {
    it('should render RangeBar components with correct data', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const dayRange = screen.getByTestId('range-bar-day');
      const weekRange = screen.getByTestId('range-bar-52wk');

      expect(dayRange).toHaveTextContent('Range: 119.2-121, Current: 120.5, Open: 119.8');
      expect(weekRange).toHaveTextContent('Range: 95-125, Current: 120.5, Open: 119.8');
    });

    it('should render TickerMetrics with formatted values', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByTestId('metric-market-capitalisation')).toBeInTheDocument();
      expect(screen.getByTestId('metric-p/e-ratio')).toBeInTheDocument();
      expect(screen.getByTestId('metric-%-from-52wk-high')).toBeInTheDocument();
      expect(screen.getByTestId('metric-volume')).toBeInTheDocument();
      expect(screen.getByTestId('metric-earnings-per-share')).toBeInTheDocument();
    });

    it('should render CompanyInfo when company data is available', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByTestId('company-info')).toBeInTheDocument();
      expect(screen.getByText('Company: CBA')).toBeInTheDocument();
    });

    it('should handle missing company data gracefully', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={null}
        />
      );

      expect(screen.queryByTestId('company-info')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for main sections', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByLabelText('Card for ticker data')).toBeInTheDocument();
      expect(screen.getByLabelText('Current share price and net change amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Intraday price movement range indicators (day range and 52 week range)')).toBeInTheDocument();
      expect(screen.getByLabelText('Financial metrics')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should use semantic data elements for price values', () => {
      const { container } = render(
        <TickerCard
          quoteData={mockQuoteData}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const currentPriceElement = container.querySelector('data[value="120.5"]');
      expect(currentPriceElement).toBeInTheDocument();
      expect(currentPriceElement?.textContent).toBe('$120.50');

      const changeElement = container.querySelector('data[value="0.5"]');
      expect(changeElement).toBeInTheDocument();
      expect(changeElement?.textContent).toBe('$0.50');

      const percentElement = container.querySelector('data[value="0.42"]');
      expect(percentElement).toBeInTheDocument();
      expect(percentElement?.textContent).toBe('+0.42%');
    });
  });

  describe('calculations', () => {
    it('should calculate percentage from 52-week high correctly', () => {
      const quoteWithHighPrice = {
        ...mockQuoteData,
        cf_last: 100,
        yrhigh: 125
      };

      render(
        <TickerCard
          quoteData={quoteWithHighPrice}
          loading={false}
          companyData={mockCompanyData}
        />
      );

      const percentFromHighMetric = screen.getByTestId('metric-%-from-52wk-high');
      expect(percentFromHighMetric).toBeInTheDocument();
    });
  });
});