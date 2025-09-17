import { render, screen, fireEvent } from '@testing-library/react';
import TrendingStocksErrorBoundary from './TrendingStocksErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('TrendingStocksErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <TrendingStocksErrorBoundary>
        <ThrowError shouldThrow={false} />
      </TrendingStocksErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <TrendingStocksErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TrendingStocksErrorBoundary>
    );

    expect(screen.getByText('Trending stocks')).toBeInTheDocument();
    expect(screen.getByText('Unable to load trending stocks')).toBeInTheDocument();
    expect(
      screen.getByText(/There was an error loading the trending stocks data/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetryMock = jest.fn();

    render(
      <TrendingStocksErrorBoundary onRetry={onRetryMock}>
        <ThrowError shouldThrow={true} />
      </TrendingStocksErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('resets error state when retry is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <TrendingStocksErrorBoundary>
        <TestComponent />
      </TrendingStocksErrorBoundary>
    );

    expect(screen.getByText('Unable to load trending stocks')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });

    shouldThrow = false;
    fireEvent.click(retryButton);

    rerender(
      <TrendingStocksErrorBoundary>
        <TestComponent />
      </TrendingStocksErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load trending stocks')).not.toBeInTheDocument();
  });

  it('logs error to console when error is caught', () => {
    render(
      <TrendingStocksErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TrendingStocksErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'TrendingStocksErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });
});
