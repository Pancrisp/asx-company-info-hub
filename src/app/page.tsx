'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import KeyStatistics from '@/features/KeyStatistics/KeyStatistics';
import TrendingStocks from '@/features/TrendingStocks/TrendingStocks';
import EmptyState from '@/components/EmptyState';
import WatchlistTable from '@/features/Watchlist/WatchlistTable';
import { useCompanyData, useMultipleQuoteData } from '@/hooks/useTickerData';
import { WatchlistProvider } from '@/hooks/useWatchlist';
import { POPULAR_STOCKS } from '@/data/stocks';

export default function Home() {
  const [currentTicker, setCurrentTicker] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const trendingTickers = POPULAR_STOCKS.slice(0, 6).map(stock => stock.ticker);
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError
  } = useMultipleQuoteData(trendingTickers);
  const { data, isLoading, error } = useCompanyData(currentTicker);

  const companyData = data?.company || null;
  const quoteData = data?.quote || null;
  // Get trending quote data for the current ticker if it exists
  const trendingQuoteData = currentTicker
    ? trendingData?.find(item => item.ticker === currentTicker.toUpperCase())?.data
    : null;

  const handleSearch = (ticker: string) => {
    setCurrentTicker(ticker);
    setHasSearched(true);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between gap-4'>
            <h1 className='text-3xl font-bold text-gray-900'>ASX Company Information</h1>
            <div className='w-full max-w-sm'>
              <SearchBar onSearch={handleSearch} loading={isLoading} error={error?.message || ''} />
            </div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(350px,450px)_1fr]'>
          <aside>
            <TrendingStocks
              onStockSelect={handleSearch}
              trendingData={trendingData}
              isLoading={trendingLoading}
              error={trendingError}
            />
          </aside>
          <section className='space-y-8'>
            <WatchlistProvider>
              {!hasSearched ? (
                <EmptyState />
              ) : (
                <KeyStatistics
                  quoteData={trendingQuoteData || quoteData}
                  loading={isLoading}
                  companyData={companyData}
                />
              )}
              <WatchlistTable />
            </WatchlistProvider>
          </section>
        </div>
      </main>
    </div>
  );
}
