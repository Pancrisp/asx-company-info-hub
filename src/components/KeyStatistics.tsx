'use client';

import { KeyStatisticsProps } from '@/types/props';
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
          <div
            className={`text-right font-semibold text-base ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(quote.cf_netchng)} ({formatPercentage(quote.pctchng)})
          </div>
        </div>

        <div id='volume' className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>Volume</span>
          <span className='text-gray-900 font-semibold text-base'>
            {formatNumber(quote.cf_volume)}
          </span>
        </div>

        <div id='market-value' className='flex justify-between items-center'>
          <span className='text-gray-600 font-medium text-base'>Market Value</span>
          <span className='text-gray-900 font-semibold text-base'>
            {formatMarketValue(quote.mkt_value)}
          </span>
        </div>

        <div id='day-range' className='space-y-2'>
          <div className='relative'>
            <div className='flex justify-between text-sm text-gray-500 mb-1'>
              <span>{formatCurrency(quote.cf_low)}</span>
              <span>Day Range</span>
              <span>{formatCurrency(quote.cf_high)}</span>
            </div>

            <div className='relative h-2 bg-gray-300 rounded-full overflow-hidden'>
              <div
                className={`absolute top-0 h-2 ${
                  quote.cf_last >= quote.cf_open ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{
                  left: `${Math.min(
                    Math.max(
                      ((Math.min(quote.cf_open, quote.cf_last) - quote.cf_low) /
                        (quote.cf_high - quote.cf_low)) *
                        100,
                      0
                    ),
                    100
                  )}%`,
                  width: `${Math.abs(
                    ((quote.cf_last - quote.cf_low) / (quote.cf_high - quote.cf_low)) * 100 -
                      ((quote.cf_open - quote.cf_low) / (quote.cf_high - quote.cf_low)) * 100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        <div id='52wk-range' className='space-y-2'>
          <div className='relative'>
            <div className='flex justify-between text-sm text-gray-500 mb-1'>
              <span>{formatCurrency(quote.yrlow)}</span>
              <span>Year Range</span>
              <span>{formatCurrency(quote.yrhigh)}</span>
            </div>

            <div className='relative h-2 bg-gray-300 rounded-full overflow-hidden'>
              <div
                className={`absolute top-0 h-2 ${
                  quote.cf_last >= quote.cf_open ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{
                  left: `${Math.min(
                    Math.max(
                      ((Math.min(quote.cf_open, quote.cf_last) - quote.yrlow) /
                        (quote.yrhigh - quote.yrlow)) *
                        100,
                      0
                    ),
                    100
                  )}%`,
                  width: `${Math.abs(
                    ((quote.cf_last - quote.yrlow) / (quote.yrhigh - quote.yrlow)) * 100 -
                      ((quote.cf_open - quote.yrlow) / (quote.yrhigh - quote.yrlow)) * 100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
