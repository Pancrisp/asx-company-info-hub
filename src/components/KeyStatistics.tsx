'use client';

import { KeyStatisticsProps } from '@/types';
import { formatCurrency, formatNumber, formatMarketValue, formatPercentage } from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';

export default function KeyStatistics({ quoteData, loading }: KeyStatisticsProps) {
  if (loading) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Key Statistics</h2>
        <LoadingSpinner text='Loading statistics...' />
      </div>
    );
  }

  if (!quoteData) {
    return null;
  }

  const { quote } = quoteData;
  const isPositive = quote.cf_netchng >= 0;

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2'>
        Key Statistics
      </h2>

      <div className='space-y-3'>
        {/* Current Price */}
        <div className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>Current Price</span>
          <span className='text-gray-900 font-semibold text-base'>
            {formatCurrency(quote.cf_last)}
          </span>
        </div>

        {/* Change */}
        <div className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>Change</span>
          <div className='text-right'>
            <span
              className={`font-semibold text-base ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(quote.cf_netchng)}
            </span>
            <span
              className={`ml-2 font-semibold text-base ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ({formatPercentage(quote.pctchng)})
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>Volume</span>
          <span className='text-gray-900 font-semibold text-base'>
            {formatNumber(quote.cf_volume)}
          </span>
        </div>

        {/* Market Value */}
        <div className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>Market Value</span>
          <span className='text-gray-900 font-semibold text-base'>
            {formatMarketValue(quote.mkt_value)}
          </span>
        </div>

        {/* 52W High */}
        <div className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>52W High</span>
          <span className='text-gray-900 font-semibold text-base'>
            {formatCurrency(quote['52wk_high'])}
          </span>
        </div>
      </div>
    </div>
  );
}
