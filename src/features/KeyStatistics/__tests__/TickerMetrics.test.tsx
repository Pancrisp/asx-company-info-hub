import { render, screen } from '@testing-library/react';
import TickerMetrics from '../TickerMetrics';

describe('TickerMetrics Component', () => {
  test('renders label and value with string value', () => {
    render(<TickerMetrics label='Test Label' value='123.45' />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('123.45')).toBeInTheDocument();
  });

  test('renders label and value with number value', () => {
    render(<TickerMetrics label='Volume' value={1234567} />);

    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  test('works with currency formatter', () => {
    const formatCurrency = jest.fn((value: number) => `$${value.toFixed(2)}`);
    render(<TickerMetrics label='Price' value={123.456} formatter={formatCurrency} />);

    expect(formatCurrency).toHaveBeenCalledWith(123.456);
    expect(formatCurrency).toHaveBeenCalledTimes(1);
    expect(screen.getByText('$123.46')).toBeInTheDocument();
  });

  test('works with percentage formatter', () => {
    const formatPercentage = jest.fn((value: number) => `${value.toFixed(2)}%`);
    render(<TickerMetrics label='Change' value={5.67} formatter={formatPercentage} />);

    expect(formatPercentage).toHaveBeenCalledWith(5.67);
    expect(formatPercentage).toHaveBeenCalledTimes(1);
    expect(screen.getByText('5.67%')).toBeInTheDocument();
  });

  test('works with number formatter', () => {
    const formatNumber = jest.fn((value: number) => value.toLocaleString());
    render(<TickerMetrics label='Volume' value={1234567} formatter={formatNumber} />);

    expect(formatNumber).toHaveBeenCalledWith(1234567);
    expect(formatNumber).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  test('maintains correct colour hierarchy in metrics labels', () => {
    render(<TickerMetrics label='Test Metric' value='Test Value' />);

    const label = screen.getByText('Test Metric');
    const value = screen.getByText('Test Value');

    expect(label).toHaveClass('text-xs', 'text-gray-500');
    expect(value).toHaveClass('text-sm', 'font-semibold', 'text-gray-900');
  });

  describe('formatter functions', () => {
    const mockFormatter = jest.fn((value: number) => `Formatted: ${value}`);

    beforeEach(() => {
      mockFormatter.mockClear();
    });

    test('calls formatter when provided with number value', () => {
      render(<TickerMetrics label='Test Label' value={100} formatter={mockFormatter} />);

      expect(mockFormatter).toHaveBeenCalledWith(100);
      expect(mockFormatter).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Formatted: 100')).toBeInTheDocument();
    });

    test('calls formatter when provided with string value', () => {
      render(<TickerMetrics label='Test Label' value='200' formatter={mockFormatter} />);

      expect(mockFormatter).toHaveBeenCalledWith('200');
      expect(mockFormatter).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Formatted: 200')).toBeInTheDocument();
    });

    test('does not call formatter when not provided', () => {
      render(<TickerMetrics label='Test Label' value={100} />);

      expect(mockFormatter).not.toHaveBeenCalled();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    test('handles formatter returning different formats', () => {
      const currencyFormatter = (value: number) => `$${value.toFixed(2)}`;
      render(<TickerMetrics label='Price' value={123.456} formatter={currencyFormatter} />);

      expect(screen.getByText('$123.46')).toBeInTheDocument();
    });
  });
});
