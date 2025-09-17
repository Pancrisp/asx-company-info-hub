'use client';

import { Fragment } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  formatCurrency,
  formatMarketValue,
  formatPercentage,
  formatRatio,
  formatVolume
} from '@/lib/api';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useTickerPrice } from '@/contexts/TickerDataContext';

import { Skeleton } from '../../components/Skeleton';
import WatchlistRangeBar from './WatchlistRangeBar';

interface WatchlistTableProps {
  onTickerSelect?: (ticker: string) => void;
}

const WatchlistTableHeaders = () => (
  <thead className='bg-gray-100'>
    <tr>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        Ticker
      </th>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        Price
      </th>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        Change
      </th>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        52W Range
      </th>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        Mkt Cap
      </th>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        Volume
      </th>
      <th className='px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'>
        P/E
      </th>
      <th className='py-3 pr-2 text-left text-sm font-medium whitespace-nowrap text-gray-500 uppercase'></th>
    </tr>
  </thead>
);

export default function WatchlistTable({ onTickerSelect }: WatchlistTableProps) {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { getQuoteData, isTickerLoading } = useTickerPrice();
  const isWatchlistLoading = isTickerLoading(watchlist);

  const watchlistData = watchlist.map(ticker => {
    const quoteData = getQuoteData(ticker);
    return {
      ticker,
      quoteData,
      hasData: !!quoteData
    };
  });

  const validData = watchlistData.filter(item => item.hasData);

  let tableContent;

  if (watchlist.length === 0) {
    tableContent = (
      <tr>
        <td colSpan={8} className='px-6 py-8 text-center'>
          <p className='text-gray-500'>Your watchlist is empty</p>
          <p className='mt-1 text-sm text-gray-400'>Add stocks by clicking the bookmark icon</p>
        </td>
      </tr>
    );
  } else if (isWatchlistLoading) {
    tableContent = watchlist.map(ticker => (
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
    ));
  } else {
    tableContent = validData.map(item => {
      if (!item.quoteData) return null;

      const { quoteData } = item;
      const isPositive = quoteData.cf_netchng > 0;
      const isNegative = quoteData.cf_netchng < 0;

      const priceChangeColor = isPositive
        ? 'text-green-600'
        : isNegative
          ? 'text-red-600'
          : 'text-gray-600';

      const changeDirection = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';

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
            data-testid={`price-change-${changeDirection}`}
            data-change-direction={changeDirection}
          >
            {formatPercentage(quoteData.pctchng)}
          </td>
          <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
            <WatchlistRangeBar
              current={quoteData.cf_last}
              low={quoteData.yrlow}
              high={quoteData.yrhigh}
            />
          </td>
          <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
            {formatMarketValue(quoteData.mkt_value)}
          </td>
          <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
            {formatVolume(quoteData.cf_volume)}
          </td>
          <td className='px-6 py-2 text-sm whitespace-nowrap text-gray-900'>
            {formatRatio(quoteData.peratio)}
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
    });
  }

  return (
    <Fragment>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Watchlist</h2>
      <div className='overflow-hidden rounded-md border border-gray-300 bg-white'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <WatchlistTableHeaders />
            <tbody
              className={`bg-white ${watchlist.length > 0 && !isWatchlistLoading ? 'divide-y divide-gray-200' : ''}`}
            >
              {tableContent}
            </tbody>
          </table>
        </div>

        {watchlist.length > 0 &&
          !isWatchlistLoading &&
          watchlistData.some(item => !item.hasData) && (
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
