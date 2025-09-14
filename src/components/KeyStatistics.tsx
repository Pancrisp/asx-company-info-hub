'use client';

import { KeyStatisticsProps } from '@/types/props';
import {
  formatCurrency,
  formatNumber,
  formatMarketValue,
  formatPercentage,
  formatRatio,
  formatPercentFromHigh
} from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';
import RangeBar from './RangeBar';
import TickerMetrics from './TickerMetrics';

export default function KeyStatistics({ quoteData, loading, companyData }: KeyStatisticsProps) {
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

  const { quote } = quoteData;
  const isPositive = quote.cf_netchng >= 0;
  const percentFromHigh = ((quote.yrhigh - quote.cf_last) / quote.yrhigh) * 100;

  return (
    <article className='bg-white p-6'>
      <header className='flex items-center gap-4 mb-6'>
        <h1 className='text-md text-gray-900'>{companyData?.ticker}</h1>
        <span className='text-md text-gray-500'>{'Company Name'}</span>
      </header>

      <section className='mb-8'>
        <div className='flex items-center gap-4'>
          <data value={quote.cf_last} className='text-3xl font-bold text-gray-900'>
            {formatCurrency(quote.cf_last)}
          </data>
          <div
            className={`px-3 py-1 rounded text-md font-semibold ${
              isPositive ? 'bg-green-100' : 'bg-red-100'
            }`}
            style={{
              color: isPositive ? 'var(--positive-green)' : 'var(--negative-red)'
            }}
          >
            <data value={quote.cf_netchng}>{formatCurrency(quote.cf_netchng)}</data> [
            <data value={quote.pctchng}>{formatPercentage(quote.pctchng)}</data>]
          </div>
        </div>
      </section>

      <RangeBar
        title='day'
        openPrice={quote.cf_open}
        lowPrice={quote.cf_low}
        highPrice={quote.cf_high}
        currentPrice={quote.cf_last}
      />
      <RangeBar
        title='52wk'
        openPrice={quote.cf_open}
        lowPrice={quote.yrlow}
        highPrice={quote.yrhigh}
        currentPrice={quote.cf_last}
      />

      <section className='grid grid-cols-2 gap-x-8 gap-y-6 mt-8'>
        <TickerMetrics
          label='Market capitalisation'
          value={quote.mkt_value}
          formatter={formatMarketValue}
        />
        <TickerMetrics label='Volume' value={quote.cf_volume} formatter={formatNumber} />
        <TickerMetrics label='P/E ratio' value={quote.peratio} formatter={formatRatio} />
        <TickerMetrics
          label='% from 52WK high'
          value={percentFromHigh}
          formatter={formatPercentFromHigh}
        />
        <TickerMetrics
          label='Earnings per share'
          value={quote.earnings}
          formatter={formatCurrency}
        />
      </section>
    </article>
  );
}
