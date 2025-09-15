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
import LoadingSpinner from './LoadingSpinner';
import RangeBar from './RangeBar';
import TickerMetrics from './TickerMetrics';
import CompanyInfo from './CompanyInfo';

interface KeyStatisticsProps {
  quoteData: QuoteData | null;
  loading: boolean;
  companyData: CompanyData | null;
}

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
  const percentFromHigh = ((quote.yrhigh - quote.cf_last) / quote.yrhigh) * 100;
  const isPositive = quote.cf_netchng > 0;
  const isNegative = quote.cf_netchng < 0;

  const priceChangeColourPicker = () => {
    if (isPositive) return { bg: 'bg-green-100', color: 'var(--positive-green)' };
    if (isNegative) return { bg: 'bg-red-100', color: 'var(--negative-red)' };
    return { bg: 'bg-gray-100', color: 'var(--unchanged-gray)' };
  };

  const priceChange = priceChangeColourPicker();

  return (
    <article aria-label='Card for ticker data' className='bg-white p-6'>
      <header className='flex items-center gap-4 mb-4'>
        <h1 className='text-md text-gray-900'>{companyData?.ticker}</h1>
        <span className='text-md text-gray-500'>{'Company Name'}</span>
      </header>
      <section aria-label='Current share price and net change amount' className='mb-6'>
        <div className='flex items-center gap-4'>
          <data value={quote.cf_last} className='text-3xl font-bold text-gray-900'>
            {formatCurrency(quote.cf_last)}
          </data>
          <div
            className={`px-3 py-1 rounded text-md font-semibold ${priceChange.bg}`}
            style={{
              color: priceChange.color
            }}
          >
            <data value={quote.cf_netchng}>{formatCurrency(quote.cf_netchng)}</data> [
            <data value={quote.pctchng}>{formatPercentage(quote.pctchng)}</data>]
          </div>
        </div>
      </section>
      <section aria-label='Intraday price movement range indicators (day range and 52 week range)'>
        <RangeBar
          title='day'
          openPrice={quote.cf_open}
          highPrice={quote.cf_high}
          lowPrice={quote.cf_low}
          currentPrice={quote.cf_last}
        />
        <RangeBar
          title='52wk'
          openPrice={quote.cf_open}
          highPrice={quote.yrhigh}
          lowPrice={quote.yrlow}
          currentPrice={quote.cf_last}
        />
      </section>
      <section aria-label='Financial metrics' className='grid grid-cols-2 gap-x-8 gap-y-4 mt-6'>
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
      <CompanyInfo companyData={companyData} loading={loading} />
    </article>
  );
}
