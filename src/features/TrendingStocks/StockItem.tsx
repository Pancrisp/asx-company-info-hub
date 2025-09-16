'use client';

import { formatCurrency, formatPercentage } from '@/lib/api';
import { useTickerPrice } from '@/contexts/TickerDataContext';

interface StockItemProps {
  ticker: string;
  name: string;
  onClick: () => void;
}

export default function StockItem({ ticker, name, onClick }: StockItemProps) {
  const { getQuoteData, isLoading, error } = useTickerPrice();
  const quoteData = getQuoteData(ticker);
  const tickerError = error(ticker);
  const tickerLoading = isLoading(ticker);

  const price = quoteData?.cf_last;
  const change = quoteData?.cf_netchng;
  const percentage = quoteData?.pctchng;
  const priceChangeColourPicker = () => {
    if (!change || !percentage) return { bg: 'bg-gray-100', color: 'var(--unchanged-gray)' };
    if (percentage > 0) return { bg: 'bg-green-100', color: 'var(--positive-green)' };
    if (percentage < 0) return { bg: 'bg-red-100', color: 'var(--negative-red)' };
    return { bg: 'bg-gray-100', color: 'var(--unchanged-gray)' };
  };

  const priceChangeStyle = priceChangeColourPicker();

  if (tickerLoading) {
    return (
      <div className='w-full border-b border-gray-300 bg-white px-4 py-3 first:rounded-t-md last:rounded-b-md last:border-b-0'>
        <div className='flex items-center justify-between'>
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-gray-900'>{ticker}</div>
            <div className='truncate text-sm text-gray-500'>{name}</div>
          </div>
          <div className='ml-4 text-right'>
            <div className='mb-1 h-4 w-16 animate-pulse rounded bg-gray-200'></div>
            <div className='h-4 w-12 animate-pulse rounded bg-gray-200'></div>
          </div>
        </div>
      </div>
    );
  }

  if (tickerError) {
    return (
      <div className='w-full border-b border-gray-300 bg-white px-4 py-3 opacity-50 first:rounded-t-md last:rounded-b-md last:border-b-0'>
        <div className='flex items-center justify-between'>
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-gray-900'>{ticker}</div>
            <div className='truncate text-sm text-gray-500'>{name}</div>
          </div>
          <div className='ml-4 text-right'>
            <div className='text-sm text-gray-400'>--</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className='w-full border-b border-gray-300 bg-white px-4 py-3 text-left transition-all duration-100 first:rounded-t-md last:rounded-b-md last:border-b-0 hover:cursor-pointer hover:bg-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
    >
      <div className='flex items-center justify-between'>
        <div className='min-w-0 flex-1'>
          <div className='font-medium text-gray-900'>{ticker}</div>
          <div className='truncate text-sm text-gray-500'>{name}</div>
        </div>
        <div className='ml-4 text-right'>
          <div className='font-semibold text-gray-900'>{price ? formatCurrency(price) : '--'}</div>
          {change !== undefined && percentage !== undefined && (
            <div
              className={`inline-block rounded px-2 py-1 text-xs font-medium ${priceChangeStyle.bg}`}
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
