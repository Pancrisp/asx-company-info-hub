'use client';

import { formatCurrency } from '@/lib/api';

interface RangeBarProps {
  title: string;
  openPrice: number;
  lowPrice: number;
  highPrice: number;
  currentPrice: number;
}

export default function RangeBar({
  title,
  openPrice,
  lowPrice,
  highPrice,
  currentPrice
}: RangeBarProps) {
  const isPositive = currentPrice >= openPrice;

  const openPercentage = ((openPrice - lowPrice) / (highPrice - lowPrice)) * 100;
  const currentPercentage = ((currentPrice - lowPrice) / (highPrice - lowPrice)) * 100;

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
            left: `${Math.min(openPercentage, currentPercentage)}%`,
            width: `${Math.abs(currentPercentage - openPercentage)}%`,
            backgroundColor: isPositive ? 'var(--positive-green)' : 'var(--negative-red)'
          }}
        />
      </div>
    </div>
  );
}
