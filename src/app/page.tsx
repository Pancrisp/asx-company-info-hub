'use client';

import { useState } from 'react';
import Search from '@/components/search';
import KeyStatistics from '@/components/KeyStatistics';
import TrendingStocks from '@/components/TrendingStocks';
import EmptyState from '@/components/EmptyState';
import { useCompanyData } from '@/hooks/useTickerData';

export default function Home() {
  const [currentTicker, setCurrentTicker] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, error } = useCompanyData(currentTicker);

  const companyData = data?.company || null;
  const quoteData = data?.quote || null;

  const handleSearch = (ticker: string) => {
    setCurrentTicker(ticker);
    setHasSearched(true);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between gap-4'>
            <h1 className='text-3xl font-bold text-gray-900'>ASX Company Information</h1>
            <div className='max-w-sm w-full'>
              <Search onSearch={handleSearch} loading={isLoading} error={error?.message || ''} />
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-[minmax(350px,450px)_1fr] gap-8'>
          <aside>
            <TrendingStocks onStockSelect={handleSearch} />
          </aside>
          <section>
            {!hasSearched ? (
              <EmptyState />
            ) : (
              <KeyStatistics quoteData={quoteData} loading={isLoading} companyData={companyData} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
