export interface Stock {
  ticker: string;
  name: string;
}

export interface CompanyData {
  company_info: string;
  ticker: string;
}

export interface QuoteData {
  symbol: string;
  quote: {
    mkt_value: number;
    cf_last: number;
    cf_open: number;
    cf_low: number;
    cf_high: number;
    cf_close: number;
    cf_volume: number;
    cf_netchng: number;
    pctchng: number;
    yrhigh: number;
    yrlow: number;
  };
}
