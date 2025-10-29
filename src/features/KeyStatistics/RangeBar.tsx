'use client';

import { formatCurrency } from '@/lib/api';

interface RangeBarProps {
  title: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  currentPrice: number;
}

export default function RangeBar({
  title,
  openPrice,
  highPrice,
  lowPrice,
  currentPrice
}: RangeBarProps) {
  const isPriceIncreasing = currentPrice >= openPrice;

  const openPositionPercentage = ((openPrice - lowPrice) / (highPrice - lowPrice)) * 100;
  const currentPositionPercentage = ((currentPrice - lowPrice) / (highPrice - lowPrice)) * 100;

  return (
    <div className='mb-6' data-testid='range-bar-container'>
      <div className='flex justify-between text-xs text-gray-500 mb-2'>
        <span>{formatCurrency(lowPrice)}</span>
        <span>{title.toUpperCase()} RANGE</span>
        <span>{formatCurrency(highPrice)}</span>
      </div>
      <div className='relative h-2 bg-gray-300 rounded-full overflow-hidden'>
        <div
          data-testid='range-progress'
          className='absolute top-0 h-2'
          style={{
            left: `${Math.min(openPositionPercentage, currentPositionPercentage)}%`,
            width: `${Math.abs(currentPositionPercentage - openPositionPercentage)}%`,
            backgroundColor: isPriceIncreasing ? 'var(--positive-green)' : 'var(--negative-red)'
          }}
        />
      </div>
    </div>
  );
}
