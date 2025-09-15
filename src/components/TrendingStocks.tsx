'use client';

import { Fragment } from 'react';
import { useMultipleCompanyData } from '@/hooks/useTickerData';
import { POPULAR_STOCKS } from '@/data/stocks';
import StockCard from './StockCard';

interface TrendingStocksProps {
  onStockSelect: (ticker: string) => void;
}

export default function TrendingStocks({ onStockSelect }: TrendingStocksProps) {
  const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);

  const { data: stocksData, isLoading, error } = useMultipleCompanyData(trendingTickers);

  const getStockByTicker = (ticker: string) => {
    return POPULAR_STOCKS.find(stock => stock.ticker === ticker);
  };

  const getStockData = (ticker: string) => {
    return stocksData?.find(item => item.ticker === ticker);
  };

  return (
    <Fragment>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>Trending stocks</h2>
      <div className='bg-white rounded-md border border-gray-300'>
        {trendingTickers.map(ticker => {
          const stock = getStockByTicker(ticker);
          const stockData = getStockData(ticker);

          if (!stock) return null;

          const isItemLoading = isLoading || !stockData?.data;

          const quote = stockData?.data?.quote?.quote;
          const price = quote?.cf_last;
          const change = quote?.cf_netchng;
          const percentage = quote?.pctchng;

          return (
            <StockCard
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
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
            <p className='text-sm text-yellow-700'>
              Some trending stocks data may be unavailable. Please try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
}
