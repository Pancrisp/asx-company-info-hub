'use client';

import { Fragment } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useTickerPrice } from '@/contexts/TickerDataContext';
import {
  formatCurrency,
  formatMarketValue,
  formatPercentage,
  formatRatio,
  formatPercentFromHigh
} from '@/lib/api';
import { TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WatchlistTable() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { getQuoteData, isLoading } = useTickerPrice();

  if (watchlist.length === 0) {
    return (
      <Fragment>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Watchlist</h2>
        <div className='rounded-md border border-gray-300 bg-white p-6'>
          <div className='py-8 text-center'>
            <p className='text-gray-500'>Your watchlist is empty</p>
            <p className='mt-1 text-sm text-gray-400'>Add stocks by clicking the bookmark icon</p>
          </div>
        </div>
      </Fragment>
    );
  }

  const hasAnyLoading = watchlist.some(ticker => isLoading(ticker));

  if (hasAnyLoading) {
    return (
      <Fragment>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Watchlist</h2>
        <div className='rounded-md border border-gray-300 bg-white p-6'>
          <LoadingSpinner text='Loading watchlist data...' />
        </div>
      </Fragment>
    );
  }

  const watchlistData = watchlist.map(ticker => {
    const quoteData = getQuoteData(ticker);
    return {
      ticker,
      quoteData,
      hasData: !!quoteData
    };
  });

  const validData = watchlistData.filter(item => item.hasData);

  return (
    <Fragment>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Watchlist</h2>
      <div className='overflow-hidden rounded-md border border-gray-300 bg-white'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Ticker
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Price
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  % Change
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Market Cap
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  P/E Ratio
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  EPS
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  % from 52wk High
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {validData.map(item => {
                if (!item.quoteData) return null;

                const { quoteData } = item;
                const percentFromHigh =
                  ((quoteData.yrhigh - quoteData.cf_last) / quoteData.yrhigh) * 100;
                const isPositive = quoteData.cf_netchng > 0;
                const isNegative = quoteData.cf_netchng < 0;

                const priceChangeColor = isPositive
                  ? 'text-green-600'
                  : isNegative
                    ? 'text-red-600'
                    : 'text-gray-600';

                return (
                  <tr key={item.ticker} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900'>
                      {item.ticker}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {formatCurrency(quoteData.cf_last)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${priceChangeColor}`}
                    >
                      {formatPercentage(quoteData.pctchng)}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {formatMarketValue(quoteData.mkt_value)}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {formatRatio(quoteData.peratio)}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {formatCurrency(quoteData.earnings)}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      {formatPercentFromHigh(percentFromHigh)}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                      <button
                        onClick={() => removeFromWatchlist(item.ticker)}
                        className='rounded p-1 transition-colors hover:bg-gray-100'
                        aria-label={`Remove ${item.ticker} from watchlist`}
                      >
                        <TrashIcon className='h-4 w-4 text-gray-400 hover:text-red-600' />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {watchlistData.some(item => !item.hasData) && (
          <div className='border-t border-yellow-200 bg-yellow-50 px-6 py-3'>
            <p className='text-sm text-yellow-700'>
              Some watchlist items failed to load. They may have been delisted or have invalid
              tickers.
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
}
