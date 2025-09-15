'use client';

import { formatCurrency, formatPercentage } from '@/lib/api';

interface StockCardProps {
  ticker: string;
  name: string;
  price?: number;
  change?: number;
  percentage?: number;
  onClick: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function StockCard({
  ticker,
  name,
  price,
  change,
  percentage,
  onClick,
  isLoading = false,
  error
}: StockCardProps) {
  const priceChangeColourPicker = () => {
    if (!change || !percentage) return { bg: 'bg-gray-100', color: 'var(--unchanged-gray)' };
    if (percentage > 0) return { bg: 'bg-green-100', color: 'var(--positive-green)' };
    if (percentage < 0) return { bg: 'bg-red-100', color: 'var(--negative-red)' };
    return { bg: 'bg-gray-100', color: 'var(--unchanged-gray)' };
  };

  const priceChangeStyle = priceChangeColourPicker();

  if (isLoading) {
    return (
      <div className='w-full px-4 py-3 first:rounded-t-md last:rounded-b-md border-b border-gray-300 last:border-b-0 bg-white'>
        <div className='flex justify-between items-center'>
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-gray-900'>{ticker}</div>
            <div className='text-sm text-gray-500 truncate'>{name}</div>
          </div>
          <div className='text-right ml-4'>
            <div className='h-4 bg-gray-200 rounded animate-pulse mb-1 w-16'></div>
            <div className='h-4 bg-gray-200 rounded animate-pulse w-12'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full px-4 py-3 first:rounded-t-md last:rounded-b-md border-b border-gray-300 last:border-b-0 bg-white opacity-50'>
        <div className='flex justify-between items-center'>
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-gray-900'>{ticker}</div>
            <div className='text-sm text-gray-500 truncate'>{name}</div>
          </div>
          <div className='text-right ml-4'>
            <div className='text-sm text-gray-400'>--</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className='w-full px-4 py-3 first:rounded-t-md last:rounded-b-md border-b border-gray-300 last:border-b-0 bg-white hover:bg-gray-100 hover:cursor-pointer transition-all duration-100 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
    >
      <div className='flex justify-between items-center'>
        <div className='min-w-0 flex-1'>
          <div className='font-medium text-gray-900'>{ticker}</div>
          <div className='text-sm text-gray-500 truncate'>{name}</div>
        </div>
        <div className='text-right ml-4'>
          <div className='font-semibold text-gray-900'>{price ? formatCurrency(price) : '--'}</div>
          {change !== undefined && percentage !== undefined && (
            <div
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${priceChangeStyle.bg}`}
              style={{ color: priceChangeStyle.color }}
            >
              {formatPercentage(percentage)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
