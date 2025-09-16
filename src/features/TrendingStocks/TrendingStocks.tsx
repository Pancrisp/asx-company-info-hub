'use client';

import { Fragment } from 'react';
import { POPULAR_STOCKS } from '@/data/stocks';
import StockItem from './StockItem';

interface TrendingStocksProps {
  onStockSelect: (ticker: string) => void;
  trendingData: Array<{
    ticker: string;
    data: any | null;
    error: any;
  }> | undefined;
  isLoading: boolean;
  error: Error | null;
}

export default function TrendingStocks({ onStockSelect, trendingData, isLoading, error }: TrendingStocksProps) {
  const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);

  const getStockByTicker = (ticker: string) => {
    return POPULAR_STOCKS.find(stock => stock.ticker === ticker);
  };

  const getStockData = (ticker: string) => {
    return trendingData?.find(stock => stock.ticker === ticker);
  };

  return (
    <Fragment>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Trending stocks</h2>
      <div className='rounded-md border border-gray-300 bg-white'>
        {trendingTickers.map(ticker => {
          const stock = getStockByTicker(ticker);
          const stockData = getStockData(ticker);

          if (!stock) return null;

          const isItemLoading = isLoading || !stockData?.data;

          const quote = stockData?.data?.quote;
          const price = quote?.cf_last;
          const change = quote?.cf_netchng;
          const percentage = quote?.pctchng;

          return (
            <StockItem
              key={ticker}
              ticker={ticker}
              name={stock.name}
              price={price}
              change={change}
              percentage={percentage}
              onClick={() => onStockSelect(ticker)}
              isLoading={isItemLoading}
              error={error?.message}
            />
          );
        })}

        {error && !isLoading && (
          <div className='mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3'>
            <p className='text-sm text-yellow-700'>
              Some trending stocks data may be unavailable. Please try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
}
