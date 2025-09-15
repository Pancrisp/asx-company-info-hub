export interface SearchComponentProps {
  onSearch: (ticker: string) => void;
  loading: boolean;
  error: string;
}

export interface LoadingSpinnerProps {
  text?: string;
}
