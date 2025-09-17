import { QuoteData, CompanyData } from '@/types/schema';

describe('testUtils', () => {
  it('should export mock data for testing', () => {
    expect(typeof mockQuoteData).toBe('object');
    expect(typeof mockCompanyData).toBe('object');
  });
});

export const mockQuoteData: QuoteData = {
  mkt_value: 180000000000,
  cf_last: 120.50,
  cf_open: 119.80,
  cf_low: 119.20,
  cf_high: 121.00,
  cf_close: 120.00,
  cf_volume: 1500000,
  cf_netchng: 0.50,
  pctchng: 0.42,
  yrhigh: 125.00,
  yrlow: 95.00,
  peratio: 15.2,
  earnings: 7.95
};

export const mockNegativeQuoteData: QuoteData = {
  ...mockQuoteData,
  cf_netchng: -0.75,
  pctchng: -0.62
};

export const mockZeroChangeQuoteData: QuoteData = {
  ...mockQuoteData,
  cf_netchng: 0,
  pctchng: 0
};

export const mockCompanyData: CompanyData = {
  ticker: 'CBA',
  company_info: 'Commonwealth Bank of Australia is a leading financial services provider offering retail, business, institutional banking and funds management services.'
};

export const mockLongCompanyData: CompanyData = {
  ticker: 'CBA',
  company_info: 'Commonwealth Bank of Australia is a leading financial services provider offering retail, business, institutional banking and funds management services. The company operates through multiple divisions including retail banking, institutional banking, business banking, and wealth management. Founded in 1911, CBA has grown to become one of Australia\'s largest banks with operations across multiple countries and a strong focus on digital innovation and customer experience.'
};

export const mockShortCompanyData: CompanyData = {
  ticker: 'CBA',
  company_info: 'Short description under 200 characters.'
};

export const mockEmptyCompanyData: CompanyData = {
  ticker: 'CBA',
  company_info: ''
};