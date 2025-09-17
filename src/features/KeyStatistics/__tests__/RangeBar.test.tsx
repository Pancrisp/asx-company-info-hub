import { render, screen } from '@testing-library/react';
import RangeBar from '../RangeBar';
import * as api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  formatCurrency: jest.fn((value: number) => `$${value.toFixed(2)}`)
}));

const mockedFormatCurrency = api.formatCurrency as jest.MockedFunction<typeof api.formatCurrency>;

describe('RangeBar Component', () => {
  const defaultProps = {
    title: 'day',
    openPrice: 100,
    lowPrice: 95,
    highPrice: 105,
    currentPrice: 102
  };

  beforeEach(() => {
    mockedFormatCurrency.mockClear();
  });

  test('renders with correct title', () => {
    render(<RangeBar {...defaultProps} />);
    expect(screen.getByText('DAY RANGE')).toBeInTheDocument();
  });

  test('displays formatted prices correctly', () => {
    render(<RangeBar {...defaultProps} />);

    expect(mockedFormatCurrency).toHaveBeenCalledWith(95);
    expect(mockedFormatCurrency).toHaveBeenCalledWith(105);
    expect(screen.getByText('$95.00')).toBeInTheDocument();
    expect(screen.getByText('$105.00')).toBeInTheDocument();
  });

  test('renders progress bar container', () => {
    render(<RangeBar {...defaultProps} />);
    expect(screen.getByTestId('range-bar-container')).toBeInTheDocument();
    expect(screen.getByTestId('range-progress')).toBeInTheDocument();
  });

  describe('Price movement colours', () => {
    test('shows green bars when current > open', () => {
      const props = { ...defaultProps, currentPrice: 103, openPrice: 100 };
      render(<RangeBar {...props} />);

      const progressBar = screen.getByTestId('range-progress');
      expect(progressBar.style.backgroundColor).toBe('var(--positive-green)');
    });

    test('shows red bars when current < open', () => {
      const props = { ...defaultProps, currentPrice: 97, openPrice: 100 };
      render(<RangeBar {...props} />);

      const progressBar = screen.getByTestId('range-progress');
      expect(progressBar.style.backgroundColor).toBe('var(--negative-red)');
    });

    test('shows green bars when current equals open', () => {
      const props = { ...defaultProps, currentPrice: 100, openPrice: 100 };
      render(<RangeBar {...props} />);

      const progressBar = screen.getByTestId('range-progress');
      expect(progressBar.style.backgroundColor).toBe('var(--positive-green)');
    });
  });

  describe('Calculating range indicator widths for intraday movement', () => {
    test('calculates correct position for positive movement', () => {
      const props = { ...defaultProps, openPrice: 100, currentPrice: 103 };
      render(<RangeBar {...props} />);

      const progressBar = screen.getByTestId('range-progress');
      expect(progressBar.style.left).toBe('50%');
      expect(progressBar.style.width).toBe('30%');
    });

    test('calculates correct position for negative movement', () => {
      const props = { ...defaultProps, openPrice: 100, currentPrice: 97 };
      render(<RangeBar {...props} />);

      const progressBar = screen.getByTestId('range-progress');
      expect(progressBar.style.left).toBe('20%');
      expect(progressBar.style.width).toBe('30%');
    });

    test('calculates position when movement starts from range boundary', () => {
      const props = { ...defaultProps, openPrice: 95, currentPrice: 100 };
      render(<RangeBar {...props} />);

      const progressBar = screen.getByTestId('range-progress');
      expect(progressBar.style.left).toBe('0%');
      expect(progressBar.style.width).toBe('50%');
    });
  });
});
