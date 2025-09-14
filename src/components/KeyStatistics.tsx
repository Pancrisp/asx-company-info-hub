'use client';

import { KeyStatisticsProps } from '@/types/props';
import { formatCurrency, formatNumber, formatMarketValue, formatPercentage } from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';

export default function KeyStatistics({ quoteData, loading, companyName }: KeyStatisticsProps) {
  if (loading) {
    return (
      <div className='bg-white p-6'>
        <LoadingSpinner text='Loading statistics...' />
      </div>
    );
  }

  if (!quoteData) {
    return null;
  }

  const { quote, symbol } = quoteData;
  const isPositive = quote.cf_netchng >= 0;

  // Calculate % from 52WK High
  const percentFromHigh = ((quote.yrhigh - quote.cf_last) / quote.yrhigh) * 100;

  return (
    <div className='bg-white p-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-4 mb-2'>
          <h1 className='text-2xl font-bold text-gray-900'>{symbol}</h1>
          <span className='text-xl text-gray-500'>{companyName || 'Company Name'}</span>
        </div>
      </div>

      {/* Price Section */}
      <div className='mb-8'>
        <div className='flex items-center gap-4 mb-4'>
          <span className='text-5xl font-bold text-gray-900'>{formatCurrency(quote.cf_last)}</span>
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(quote.cf_netchng)} [{formatPercentage(quote.pctchng)}]
          </div>
        </div>
      </div>

      {/* Day Range */}
      <div className='mb-6'>
        <div className='flex justify-between text-sm text-gray-500 mb-2'>
          <span>{formatCurrency(quote.cf_low)}</span>
          <span className='font-medium'>DAY RANGE</span>
          <span>{formatCurrency(quote.cf_high)}</span>
        </div>
        <div className='relative h-2 bg-gray-300 rounded-full'>
          <div
            className={`absolute top-0 h-2 ${
              quote.cf_last >= quote.cf_open ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              left: `${Math.min(
                ((quote.cf_open - quote.cf_low) / (quote.cf_high - quote.cf_low)) * 100,
                ((quote.cf_last - quote.cf_low) / (quote.cf_high - quote.cf_low)) * 100
              )}%`,
              width: `${Math.abs(
                ((quote.cf_last - quote.cf_low) / (quote.cf_high - quote.cf_low)) * 100 -
                  ((quote.cf_open - quote.cf_low) / (quote.cf_high - quote.cf_low)) * 100
              )}%`
            }}
          />
        </div>
      </div>

      {/* Year Range */}
      <div className='mb-8'>
        <div className='flex justify-between text-sm text-gray-500 mb-2'>
          <span>{formatCurrency(quote.yrlow)}</span>
          <span className='font-medium'>52WK RANGE</span>
          <span>{formatCurrency(quote.yrhigh)}</span>
        </div>
        <div className='relative h-2 bg-gray-300 rounded-full'>
          <div
            className={`absolute top-0 h-2 ${
              quote.cf_last >= quote.cf_open ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              left: `${Math.min(
                ((quote.cf_open - quote.yrlow) / (quote.yrhigh - quote.yrlow)) * 100,
                ((quote.cf_last - quote.yrlow) / (quote.yrhigh - quote.yrlow)) * 100
              )}%`,
              width: `${Math.abs(
                ((quote.cf_last - quote.yrlow) / (quote.yrhigh - quote.yrlow)) * 100 -
                  ((quote.cf_open - quote.yrlow) / (quote.yrhigh - quote.yrlow)) * 100
              )}%`
            }}
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
        <div>
          <div className='text-sm text-gray-500 mb-1'>Market Cap</div>
          <div className='text-lg font-semibold text-gray-900'>
            {formatMarketValue(quote.mkt_value)}
          </div>
        </div>

        <div>
          <div className='text-sm text-gray-500 mb-1'>Volume</div>
          <div className='text-lg font-semibold text-gray-900'>{formatNumber(quote.cf_volume)}</div>
        </div>

        <div>
          <div className='text-sm text-gray-500 mb-1'>P/E Ratio</div>
          <div className='text-lg font-semibold text-gray-900'>{quote.peratio.toFixed(2)}</div>
        </div>

        <div>
          <div className='text-sm text-gray-500 mb-1'>% from 52WK High</div>
          <div className='text-lg font-semibold text-gray-900'>{percentFromHigh.toFixed(2)}%</div>
        </div>

        <div>
          <div className='text-sm text-gray-500 mb-1'>EPS</div>
          <div className='text-lg font-semibold text-gray-900'>
            {formatCurrency(quote.earnings)}
          </div>
        </div>

        <div>{/* Empty cell as shown in the image */}</div>
      </div>
    </div>
  );
}
