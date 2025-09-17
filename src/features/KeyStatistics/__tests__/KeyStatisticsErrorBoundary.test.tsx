import { render, screen, fireEvent } from '@testing-library/react';
import KeyStatisticsErrorBoundary from '../KeyStatisticsErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('KeyStatisticsErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <KeyStatisticsErrorBoundary>
        <ThrowError shouldThrow={false} />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <KeyStatisticsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText('Stock details')).toBeInTheDocument();
    expect(screen.getByText('Unable to load stock details')).toBeInTheDocument();
    expect(screen.getByText(/There was an error loading the stock information/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetryMock = jest.fn();

    render(
      <KeyStatisticsErrorBoundary onRetry={onRetryMock}>
        <ThrowError shouldThrow={true} />
      </KeyStatisticsErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClearSearch when clear search button is clicked', () => {
    const onClearSearchMock = jest.fn();

    render(
      <KeyStatisticsErrorBoundary onClearSearch={onClearSearchMock}>
        <ThrowError shouldThrow={true} />
      </KeyStatisticsErrorBoundary>
    );

    const clearButton = screen.getByRole('button', { name: /search different stock/i });
    fireEvent.click(clearButton);

    expect(onClearSearchMock).toHaveBeenCalledTimes(1);
  });

  it('shows clear search button only when onClearSearch prop is provided', () => {
    render(
      <KeyStatisticsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.queryByRole('button', { name: /search different stock/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('resets error state when retry is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <KeyStatisticsErrorBoundary>
        <TestComponent />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText('Unable to load stock details')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });

    shouldThrow = false;
    fireEvent.click(retryButton);

    rerender(
      <KeyStatisticsErrorBoundary>
        <TestComponent />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load stock details')).not.toBeInTheDocument();
  });

  it('resets error state when clear search is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;
    const onClearSearchMock = jest.fn();

    const { rerender } = render(
      <KeyStatisticsErrorBoundary onClearSearch={onClearSearchMock}>
        <TestComponent />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText('Unable to load stock details')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /search different stock/i });

    shouldThrow = false;
    fireEvent.click(clearButton);

    rerender(
      <KeyStatisticsErrorBoundary onClearSearch={onClearSearchMock}>
        <TestComponent />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load stock details')).not.toBeInTheDocument();
  });

  it('logs error to console when error is caught', () => {
    render(
      <KeyStatisticsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </KeyStatisticsErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'KeyStatisticsErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('displays helpful tips in error message', () => {
    render(
      <KeyStatisticsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </KeyStatisticsErrorBoundary>
    );

    expect(screen.getByText(/Try searching for popular ASX stocks like CBA, BHP, or WOW/)).toBeInTheDocument();
  });
});