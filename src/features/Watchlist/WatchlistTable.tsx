'use client';

import { Fragment } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  formatCurrency,
  formatMarketValue,
  formatPercentage,
  formatRatio,
  formatPercentFromHigh
} from '@/lib/api';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useTickerPrice } from '@/contexts/TickerDataContext';

import { Skeleton } from '../../components/Skeleton';

interface WatchlistTableProps {
  onTickerSelect?: (ticker: string) => void;
}

export default function WatchlistTable({ onTickerSelect }: WatchlistTableProps) {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { getQuoteData, isTickerLoading } = useTickerPrice();
  const isWatchlistLoading = isTickerLoading(watchlist);

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

  if (isWatchlistLoading) {
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
                    Change
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
                    From 52wk High
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {watchlist.map(ticker => (
                  <tr key={ticker}>
                    <td className='px-6 py-2 text-sm font-medium whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-12' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-16' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-12' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-16' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-10' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-14' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-12' />
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <Skeleton className='h-4 w-4' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  Change
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
                  From 52wk High
                </th>
                <th className='py-3 pr-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'></th>
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
                  <tr
                    key={item.ticker}
                    className='group cursor-pointer hover:bg-gray-50'
                    onClick={() => onTickerSelect?.(item.ticker)}
                    role='button'
                    tabIndex={0}
                    aria-label={`View details for ${item.ticker}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onTickerSelect?.(item.ticker);
                      }
                    }}
                  >
                    <td className='px-6 py-2 text-sm font-medium whitespace-nowrap text-gray-900'>
                      {item.ticker}
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      {formatCurrency(quoteData.cf_last)}
                    </td>
                    <td
                      className={`px-6 py-2 text-sm font-medium whitespace-nowrap ${priceChangeColor}`}
                    >
                      {formatPercentage(quoteData.pctchng)}
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      {formatMarketValue(quoteData.mkt_value)}
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      {formatRatio(quoteData.peratio)}
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      {formatCurrency(quoteData.earnings)}
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      {formatPercentFromHigh(percentFromHigh)}
                    </td>
                    <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
                      <button
                        className='rounded p-1 transition-colors hover:bg-gray-100'
                        aria-label={`Remove ${item.ticker} from watchlist`}
                        onClick={e => {
                          e.stopPropagation();
                          removeFromWatchlist(item.ticker);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            removeFromWatchlist(item.ticker);
                          }
                        }}
                      >
                        <TrashIcon className='h-4 w-4 cursor-pointer text-gray-400 opacity-0 transition-all group-focus-within:opacity-100 group-hover:opacity-100 hover:text-red-600 focus:text-red-600' />
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
