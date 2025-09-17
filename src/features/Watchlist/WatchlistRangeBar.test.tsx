import { render, screen } from '@testing-library/react';
import WatchlistRangeBar from './WatchlistRangeBar';

describe('WatchlistRangeBar', () => {
  describe('edge cases', () => {
    it('handles current price below low range', () => {
      render(<WatchlistRangeBar current={40} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '0');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'low');
    });

    it('handles current price above high range', () => {
      render(<WatchlistRangeBar current={120} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '100');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'high');
    });
  });

  describe('percentage calculations', () => {
    it('calculates 0% correctly when current equals low', () => {
      render(<WatchlistRangeBar current={50} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '0');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'low');
    });

    it('calculates 100% correctly when current equals high', () => {
      render(<WatchlistRangeBar current={100} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '100');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'high');
    });

    it('calculates 50% correctly when current is midpoint', () => {
      render(<WatchlistRangeBar current={75} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '50');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'mid');
    });

    it('calculates 25% correctly', () => {
      render(<WatchlistRangeBar current={62.5} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '25');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'low');
    });

    it('calculates 75% correctly', () => {
      render(<WatchlistRangeBar current={87.5} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '75');
      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'high');
    });
  });

  describe('range level categorization', () => {
    it('categorizes low range correctly (≤ 33%)', () => {
      render(<WatchlistRangeBar current={60} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'low');
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '20');
    });

    it('categorizes middle range correctly (33% - 66%)', () => {
      render(<WatchlistRangeBar current={75} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'mid');
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '50');
    });

    it('categorizes high range correctly (> 66%)', () => {
      render(<WatchlistRangeBar current={90} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'high');
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '80');
    });

    it('handles boundary at exactly 33%', () => {
      render(<WatchlistRangeBar current={66.5} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'low');
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '33');
    });

    it('handles boundary at exactly 66%', () => {
      render(<WatchlistRangeBar current={83} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-fill')).toHaveAttribute('data-range-level', 'high');
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('data-percentage', '66');
    });
  });

  describe('tooltip accessibility', () => {
    it('includes percentage in tooltip title', () => {
      render(<WatchlistRangeBar current={75} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('title', '50% of 52w range');
    });

    it('rounds percentage to whole number in tooltip', () => {
      render(<WatchlistRangeBar current={66.666} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('title', '33% of 52w range');
    });

    it('handles 0% in tooltip', () => {
      render(<WatchlistRangeBar current={50} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('title', '0% of 52w range');
    });

    it('handles 100% in tooltip', () => {
      render(<WatchlistRangeBar current={100} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toHaveAttribute('title', '100% of 52w range');
    });
  });

  describe('decimal precision handling', () => {
    it('handles decimal prices correctly', () => {
      render(<WatchlistRangeBar current={75.123} low={50.456} high={100.789} />);

      const expectedPercentage = ((75.123 - 50.456) / (100.789 - 50.456)) * 100;
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute(
        'data-percentage',
        expectedPercentage.toFixed(0)
      );
    });

    it('handles very small ranges', () => {
      render(<WatchlistRangeBar current={50.005} low={50.001} high={50.01} />);

      const expectedPercentage = ((50.005 - 50.001) / (50.01 - 50.001)) * 100;
      expect(screen.getByTestId('range-bar-container')).toHaveAttribute(
        'data-percentage',
        expectedPercentage.toFixed(0)
      );
    });
  });

  describe('component structure', () => {
    it('renders range bar container and fill elements', () => {
      render(<WatchlistRangeBar current={75} low={50} high={100} />);

      expect(screen.getByTestId('range-bar-container')).toBeInTheDocument();
      expect(screen.getByTestId('range-bar-fill')).toBeInTheDocument();
    });

    it('maintains data consistency between container and fill', () => {
      render(<WatchlistRangeBar current={80} low={50} high={100} />);

      const container = screen.getByTestId('range-bar-container');
      const fill = screen.getByTestId('range-bar-fill');

      expect(container).toHaveAttribute('data-percentage', '60');
      expect(fill).toHaveAttribute('data-range-level', 'mid');
      expect(container).toHaveAttribute('data-range-level', 'mid');
    });

    it('provides accessible tooltip information', () => {
      render(<WatchlistRangeBar current={75} low={50} high={100} />);

      const container = screen.getByTestId('range-bar-container');
      expect(container).toHaveAttribute('title');
      expect(container.getAttribute('title')).toMatch(/^\d+% of 52w range$/);
    });
  });
});
