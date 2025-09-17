'use client';

import { useState } from 'react';

import KeyStatistics from '@/features/KeyStatistics/KeyStatistics';
import KeyStatisticsErrorBoundary from '@/features/KeyStatistics/KeyStatisticsErrorBoundary';
import TrendingStocks from '@/features/TrendingStocks/TrendingStocks';
import TrendingStocksErrorBoundary from '@/features/TrendingStocks/TrendingStocksErrorBoundary';
import WatchlistTable from '@/features/Watchlist/WatchlistTable';
import WatchlistErrorBoundary from '@/features/Watchlist/WatchlistErrorBoundary';
import SearchBar from '@/components/SearchBar';
import HeaderErrorBoundary from '@/components/HeaderErrorBoundary';

import { useTickerData } from '@/contexts/TickerDataContext';
import { WatchlistProvider } from '@/hooks/useWatchlist';

export default function Home() {
  const [currentTicker, setCurrentTicker] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { companyData, quoteData, isLoading, error } = useTickerData(currentTicker);

  const handleSearch = (ticker: string) => {
    setCurrentTicker(ticker);
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setCurrentTicker('');
    setHasSearched(false);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <HeaderErrorBoundary>
        <header className='border-b border-gray-200 bg-white shadow-sm'>
          <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <h1 className='text-center text-3xl font-bold text-gray-900 sm:text-left'>ASX Company Information</h1>
              <div className='w-full sm:max-w-sm'>
                <SearchBar onSearch={handleSearch} loading={isLoading} error={error?.message || ''} />
              </div>
            </div>
          </div>
        </header>
      </HeaderErrorBoundary>

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(350px,450px)_1fr]'>
          <aside>
            <TrendingStocksErrorBoundary>
              <TrendingStocks onStockSelect={handleSearch} />
            </TrendingStocksErrorBoundary>
          </aside>
          <section className='space-y-8'>
            <WatchlistProvider>
              <KeyStatisticsErrorBoundary onClearSearch={handleClearSearch}>
                <KeyStatistics
                  quoteData={quoteData}
                  loading={isLoading}
                  companyData={companyData}
                  showEmptyState={!hasSearched}
                />
              </KeyStatisticsErrorBoundary>
              <WatchlistErrorBoundary>
                <WatchlistTable onTickerSelect={handleSearch} />
              </WatchlistErrorBoundary>
            </WatchlistProvider>
          </section>
        </div>
      </main>
    </div>
  );
}
