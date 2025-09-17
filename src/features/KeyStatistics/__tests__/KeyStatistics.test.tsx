import React from 'react';
import { render, screen } from '@testing-library/react';
import KeyStatistics from '../KeyStatistics';
import { mockQuoteData, mockCompanyData } from './testUtils';
import { QuoteData, CompanyData } from '@/types/schema';

jest.mock('../TickerCard', () => {
  return function MockTickerCard({ quoteData, loading, companyData, showEmptyState }: { quoteData: QuoteData | null; loading: boolean; companyData: CompanyData | null; showEmptyState?: boolean }) {
    return (
      <div data-testid="ticker-card">
        <div>Loading: {loading.toString()}</div>
        <div>ShowEmptyState: {showEmptyState.toString()}</div>
        <div>HasQuoteData: {(!!quoteData).toString()}</div>
        <div>HasCompanyData: {(!!companyData).toString()}</div>
        {quoteData && <div>Ticker: {companyData?.ticker}</div>}
      </div>
    );
  };
});

describe('KeyStatistics', () => {
  it('should render header with correct title', () => {
    render(
      <KeyStatistics
        quoteData={null}
        loading={false}
        companyData={null}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Stock details')).toBeInTheDocument();
  });

  it('should pass loading state to TickerCard', () => {
    render(
      <KeyStatistics
        quoteData={null}
        loading={true}
        companyData={null}
      />
    );

    expect(screen.getByText('Loading: true')).toBeInTheDocument();
  });

  it('should pass quote data to TickerCard', () => {
    render(
      <KeyStatistics
        quoteData={mockQuoteData}
        loading={false}
        companyData={mockCompanyData}
      />
    );

    expect(screen.getByText('HasQuoteData: true')).toBeInTheDocument();
    expect(screen.getByText('HasCompanyData: true')).toBeInTheDocument();
    expect(screen.getByText('Ticker: CBA')).toBeInTheDocument();
  });

  it('should pass empty state flag to TickerCard', () => {
    render(
      <KeyStatistics
        quoteData={null}
        loading={false}
        companyData={null}
        showEmptyState={true}
      />
    );

    expect(screen.getByText('ShowEmptyState: true')).toBeInTheDocument();
  });

  it('should default showEmptyState to false when not provided', () => {
    render(
      <KeyStatistics
        quoteData={null}
        loading={false}
        companyData={null}
      />
    );

    expect(screen.getByText('ShowEmptyState: false')).toBeInTheDocument();
  });

  it('should render TickerCard component', () => {
    render(
      <KeyStatistics
        quoteData={mockQuoteData}
        loading={false}
        companyData={mockCompanyData}
      />
    );

    expect(screen.getByTestId('ticker-card')).toBeInTheDocument();
  });
});