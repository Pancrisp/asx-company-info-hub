'use client';

import { Fragment } from 'react';
import { POPULAR_STOCKS } from '@/data/stocks';
import { useTickerPrice } from '@/contexts/TickerDataContext';
import StockItem from './StockItem';

interface TrendingStocksProps {
  onStockSelect: (ticker: string) => void;
}

export default function TrendingStocks({ onStockSelect }: TrendingStocksProps) {
  const { isTickerLoading } = useTickerPrice();
  const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
  const isTrendingTickersLoading = isTickerLoading(trendingTickers);

  const getStockByTicker = (ticker: string) => {
    return POPULAR_STOCKS.find(stock => stock.ticker === ticker);
  };

  return (
    <Fragment>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Trending stocks</h2>
      <aside
        aria-label='A list of trending stocks'
        className='rounded-md border border-gray-300 bg-white'
        data-testid="trending-stocks-container"
      >
        {trendingTickers.map(ticker => {
          const stock = getStockByTicker(ticker);

          if (!stock) return null;

          return (
            <StockItem
              key={ticker}
              ticker={ticker}
              name={stock.name}
              onClick={() => onStockSelect(ticker)}
              isLoading={isTrendingTickersLoading}
            />
          );
        })}
      </aside>
    </Fragment>
  );
}
