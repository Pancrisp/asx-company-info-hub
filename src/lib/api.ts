import { CompanyData, QuoteData } from '@/types/schema';

const API_BASE_URL = '/api/proxy';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchCompanyInformation(ticker: string): Promise<CompanyData> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/market_data/company_information?ticker=${ticker.toUpperCase()}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(`Ticker '${ticker.toUpperCase()}' not found or may be delisted`, 404);
      } else if (response.status === 400) {
        throw new ApiError('Invalid request. Please check the ticker symbol', 400);
      } else {
        throw new ApiError(
          'Failed to fetch company information. Please try again later',
          response.status
        );
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error fetching company information:', error);
    throw new ApiError('Failed to fetch company information. Please try again later');
  }
}

export async function fetchQuoteData(ticker: string): Promise<QuoteData> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/market_data/quotes?market_key=asx&listing_key=${ticker.toUpperCase()}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(`Quote data for ticker '${ticker.toUpperCase()}' not found`, 404);
      } else if (response.status === 400) {
        throw new ApiError('Invalid request. Please check the ticker symbol', 400);
      } else {
        throw new ApiError('Failed to fetch quote data. Please try again later', response.status);
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error fetching quote data:', error);
    throw new ApiError('Failed to fetch quote data. Please try again later');
  }
}

export function isValidTicker(ticker: string): boolean {
  // Check if ticker is at least 3 characters and contains only alphanumeric characters
  const trimmedTicker = ticker.trim();
  return /^[A-Z0-9]{3,}$/i.test(trimmedTicker);
}

export function formatTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AU').format(value);
}

export function formatMarketValue(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return formatCurrency(value);
}

export function formatPercentage(value: number): string {
  const formatted = value.toFixed(2);
  return `${value >= 0 ? '+' : ''}${formatted}%`;
}

export function formatRatio(value: number): string {
  return value.toFixed(2);
}

export function formatPercentFromHigh(value: number): string {
  return `${value.toFixed(2)}%`;
}
