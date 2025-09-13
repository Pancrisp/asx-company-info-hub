import { RefObject, FormEvent } from 'react';
import { Stock, QuoteData, CompanyData } from './schema';

export interface SearchComponentProps {
  onSearch: (ticker: string) => void;
  currentTicker: string;
  loading: boolean;
  error: string;
}

export interface SearchInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  loading: boolean;
  isDropdownOpen: boolean;
  highlightedIndex: number;
  validationError: string;
  error: string;
  inputRef: RefObject<HTMLInputElement | null>;
}

export interface SearchDropdownProps {
  isOpen: boolean;
  stocks: Stock[];
  highlightedIndex: number;
  onStockSelect: (stock: Stock) => void;
  onHighlightChange: (index: number) => void;
  filterQuery: string;
  dropdownRef: RefObject<HTMLDivElement>;
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
