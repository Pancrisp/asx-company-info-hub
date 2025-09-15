import { QuoteData, CompanyData } from './schema';

export interface SearchComponentProps {
  onSearch: (ticker: string) => void;
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
