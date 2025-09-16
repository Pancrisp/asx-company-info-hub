'use client';

import {
  formatCurrency,
  formatNumber,
  formatMarketValue,
  formatPercentage,
  formatRatio,
  formatPercentFromHigh
} from '@/lib/api';
import { QuoteData, CompanyData } from '@/types/schema';
import RangeBar from './RangeBar';
import TickerMetrics from './TickerMetrics';
import CompanyInfo from './CompanyInfo';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkIconOutline } from '@heroicons/react/24/outline';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Skeleton } from '../../components/Skeleton';

interface KeyStatisticsProps {
  quoteData: QuoteData | null;
  loading: boolean;
  companyData: CompanyData | null;
}

export default function KeyStatistics({ quoteData, loading, companyData }: KeyStatisticsProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (loading) {
    return (
      <article aria-label='Card for ticker data' className='bg-white p-6'>
        <header className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-6 w-24' />
          </div>
          <div className='p-2'>
            <Skeleton className='h-6 w-6' />
          </div>
        </header>
        <section aria-label='Current share price and net change amount' className='mb-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-8 w-32' />
          </div>
        </section>
        <section aria-label='Intraday price movement range indicators (day range and 52 week range)'>
          <div className='mb-4'>
            <Skeleton className='mb-2 h-4 w-12' />
            <Skeleton className='h-2 w-full' />
          </div>
          <div className='mb-6'>
            <Skeleton className='mb-2 h-4 w-12' />
            <Skeleton className='h-2 w-full' />
          </div>
        </section>
        <section aria-label='Financial metrics' className='mt-6 grid grid-cols-3 gap-x-8 gap-y-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='space-y-1'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-5 w-16' />
            </div>
          ))}
        </section>
        <div className='mt-6 space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </article>
    );
  }

  if (!quoteData) {
    return null;
  }

  const ticker = companyData?.ticker || '';
  const inWatchlist = isInWatchlist(ticker);
  const percentFromHigh = ((quoteData.yrhigh - quoteData.cf_last) / quoteData.yrhigh) * 100;
  const isPositive = quoteData.cf_netchng > 0;
  const isNegative = quoteData.cf_netchng < 0;

  const priceChangeColourPicker = () => {
    if (isPositive) return { bg: 'bg-green-100', color: 'var(--positive-green)' };
    if (isNegative) return { bg: 'bg-red-100', color: 'var(--negative-red)' };
    return { bg: 'bg-gray-100', color: 'var(--unchanged-gray)' };
  };

  const priceChange = priceChangeColourPicker();

  return (
    <article aria-label='Card for ticker data' className='bg-white p-6'>
      <header className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h1 className='text-md text-gray-900'>{companyData?.ticker}</h1>
          <span className='text-md text-gray-500'>{'Company Name'}</span>
        </div>
        <button
          onClick={() => toggleWatchlist(ticker)}
          className='cursor-pointer rounded-full border-2 border-gray-300 bg-gray-100 p-2 transition-colors hover:bg-gray-200'
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWatchlist ? (
            <BookmarkIconSolid className='h-6 w-6 text-gray-500' />
          ) : (
            <BookmarkIconOutline className='h-6 w-6 text-gray-600' />
          )}
        </button>
      </header>
      <section aria-label='Current share price and net change amount' className='mb-6'>
        <div className='flex items-center gap-4'>
          <data value={quoteData.cf_last} className='text-3xl font-bold text-gray-900'>
            {formatCurrency(quoteData.cf_last)}
          </data>
          <div
            className={`text-md rounded px-3 py-1 font-semibold ${priceChange.bg}`}
            style={{
              color: priceChange.color
            }}
          >
            <data value={quoteData.cf_netchng}>{formatCurrency(quoteData.cf_netchng)}</data> [
            <data value={quoteData.pctchng}>{formatPercentage(quoteData.pctchng)}</data>]
          </div>
        </div>
      </section>
      <section aria-label='Intraday price movement range indicators (day range and 52 week range)'>
        <RangeBar
          title='day'
          openPrice={quoteData.cf_open}
          highPrice={quoteData.cf_high}
          lowPrice={quoteData.cf_low}
          currentPrice={quoteData.cf_last}
        />
        <RangeBar
          title='52wk'
          openPrice={quoteData.cf_open}
          highPrice={quoteData.yrhigh}
          lowPrice={quoteData.yrlow}
          currentPrice={quoteData.cf_last}
        />
      </section>
      <section aria-label='Financial metrics' className='mt-6 grid grid-cols-3 gap-x-8 gap-y-4'>
        <TickerMetrics
          label='Market capitalisation'
          value={quoteData.mkt_value}
          formatter={formatMarketValue}
        />
        <TickerMetrics label='P/E ratio' value={quoteData.peratio} formatter={formatRatio} />

        <TickerMetrics
          label='% from 52WK high'
          value={percentFromHigh}
          formatter={formatPercentFromHigh}
        />
        <TickerMetrics label='Volume' value={quoteData.cf_volume} formatter={formatNumber} />
        <TickerMetrics
          label='Earnings per share'
          value={quoteData.earnings}
          formatter={formatCurrency}
        />
      </section>
      <CompanyInfo companyData={companyData} loading={loading} />
    </article>
  );
}
