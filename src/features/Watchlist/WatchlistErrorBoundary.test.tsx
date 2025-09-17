import { render, screen, fireEvent } from '@testing-library/react';
import WatchlistErrorBoundary from './WatchlistErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('WatchlistErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <WatchlistErrorBoundary>
        <ThrowError shouldThrow={false} />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <WatchlistErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Watchlist unavailable')).toBeInTheDocument();
    expect(screen.getByText(/There was an error loading your watchlist/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetryMock = jest.fn();

    render(
      <WatchlistErrorBoundary onRetry={onRetryMock}>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('calls onAddStocks when start fresh button is clicked', () => {
    const onAddStocksMock = jest.fn();

    render(
      <WatchlistErrorBoundary onAddStocks={onAddStocksMock}>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    const startFreshButton = screen.getByRole('button', { name: /start fresh watchlist/i });
    fireEvent.click(startFreshButton);

    expect(onAddStocksMock).toHaveBeenCalledTimes(1);
  });

  it('shows start fresh button only when onAddStocks prop is provided', () => {
    render(
      <WatchlistErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    expect(
      screen.queryByRole('button', { name: /start fresh watchlist/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('resets error state when retry is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <WatchlistErrorBoundary>
        <TestComponent />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('Watchlist unavailable')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });

    shouldThrow = false;
    fireEvent.click(retryButton);

    rerender(
      <WatchlistErrorBoundary>
        <TestComponent />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Watchlist unavailable')).not.toBeInTheDocument();
  });

  it('resets error state when start fresh is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;
    const onAddStocksMock = jest.fn();

    const { rerender } = render(
      <WatchlistErrorBoundary onAddStocks={onAddStocksMock}>
        <TestComponent />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('Watchlist unavailable')).toBeInTheDocument();

    const startFreshButton = screen.getByRole('button', { name: /start fresh watchlist/i });

    shouldThrow = false;
    fireEvent.click(startFreshButton);

    rerender(
      <WatchlistErrorBoundary onAddStocks={onAddStocksMock}>
        <TestComponent />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Watchlist unavailable')).not.toBeInTheDocument();
  });

  it('logs error to console when error is caught', () => {
    render(
      <WatchlistErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'WatchlistErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('displays recovery options and instructions', () => {
    render(
      <WatchlistErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    expect(screen.getByText('Recovery options:')).toBeInTheDocument();
    expect(
      screen.getByText(/Use the search bar above to find and bookmark stocks manually/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Select stocks from the trending list/)).toBeInTheDocument();
    expect(screen.getByText(/Try clearing your browser cache/)).toBeInTheDocument();
  });

  it('mentions localStorage and network issues in error description', () => {
    render(
      <WatchlistErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WatchlistErrorBoundary>
    );

    expect(
      screen.getByText(/corrupted local storage, network issues, or problems fetching stock data/)
    ).toBeInTheDocument();
  });
});
