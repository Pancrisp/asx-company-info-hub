export interface CompanyData {
  ticker: string;
  company_info: string;
}

export interface QuoteData {
  symbol: string;
  quote: {
    cf_last: number; // Current price
    cf_netchng: number; // Price change
    pctchng: number; // Percentage change
    cf_volume: number; // Volume
    mkt_value: number; // Market value
    "52wk_high": number; // 52 week high
    // Additional fields from API
    cf_open?: number;
    cf_high?: number;
    cf_low?: number;
    cf_prev?: number;
  };
}

export interface AppState {
  loading: boolean;
  error: string;
  companyData: CompanyData | null;
  quoteData: QuoteData | null;
  currentTicker: string;
}

export interface SearchComponentProps {
  onSearch: (ticker: string) => void;
  currentTicker: string;
  loading: boolean;
  error: string;
}

export interface KeyStatisticsProps {
  quoteData: QuoteData | null;
  loading: boolean;
}

export interface CompanyInfoProps {
  companyData: CompanyData | null;
  loading: boolean;
}

export interface LoadingSpinnerProps {
  text?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
