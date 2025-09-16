'use client';

import { useWatchlist } from '@/hooks/useWatchlist';
import { useMultipleQuoteData } from '@/hooks/useTickerData';
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
  const { watchlist, watchlistQuoteData, removeFromWatchlist } = useWatchlist();
  const tickersNeedingFetch = watchlist.filter(ticker => !watchlistQuoteData.has(ticker));
  const { data: fetchedData, isLoading } = useMultipleQuoteData(tickersNeedingFetch);

  if (watchlist.length === 0) {
    return (
      <div className='rounded-lg bg-white p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>Watchlist</h2>
        <div className='py-8 text-center'>
          <p className='text-gray-500'>Your watchlist is empty</p>
          <p className='mt-1 text-sm text-gray-400'>Add stocks by clicking the bookmark icon</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='rounded-lg bg-white p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>Watchlist</h2>
        <LoadingSpinner text='Loading watchlist data...' />
      </div>
    );
  }

  const combinedData = watchlist.map(ticker => {
    const cachedData = watchlistQuoteData.get(ticker);
    if (cachedData) {
      return {
        ticker,
        data: cachedData,
        error: null
      };
    }

    const fetchedItem = fetchedData?.find(item => item.ticker === ticker);
    return fetchedItem || { ticker, data: null, error: new Error('No data available') };
  });

  const validData = combinedData.filter(item => item.data && !item.error);

  return (
    <div className='overflow-hidden rounded-lg bg-white'>
      <div className='border-b border-gray-200 px-6 py-4'>
        <h2 className='text-xl font-semibold text-gray-900'>Watchlist</h2>
      </div>

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
              if (!item.data) return null;

              const { quote } = item.data;
              const percentFromHigh = ((quote.yrhigh - quote.cf_last) / quote.yrhigh) * 100;
              const isPositive = quote.cf_netchng > 0;
              const isNegative = quote.cf_netchng < 0;

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
                    {formatCurrency(quote.cf_last)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${priceChangeColor}`}
                  >
                    {formatPercentage(quote.pctchng)}
                  </td>
                  <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                    {formatMarketValue(quote.mkt_value)}
                  </td>
                  <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                    {formatRatio(quote.peratio)}
                  </td>
                  <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                    {formatCurrency(quote.earnings)}
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

      {combinedData.some(item => item.error) && (
        <div className='border-t border-yellow-200 bg-yellow-50 px-6 py-3'>
          <p className='text-sm text-yellow-700'>
            Some watchlist items failed to load. They may have been delisted or have invalid
            tickers.
          </p>
        </div>
      )}
    </div>
  );
}
