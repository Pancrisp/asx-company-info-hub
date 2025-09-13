'use client';

import { useState } from 'react';
import Search from '@/components/search';
import KeyStatistics from '@/components/KeyStatistics';
import CompanyInfo from '@/components/CompanyInfo';
import { useCompanyInformation, useQuoteData } from '@/hooks/useTickerData';

export default function Home() {
  const [currentTicker, setCurrentTicker] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const {
    data: companyInfo,
    isLoading: companyLoading,
    error: companyError
  } = useCompanyInformation(currentTicker);
  const {
    data: quoteData,
    isLoading: quoteLoading,
    error: quoteError
  } = useQuoteData(currentTicker);

  const isLoading = companyLoading || quoteLoading;
  const error = companyError || quoteError;

  const hasResults = hasSearched;

  const handleSearch = (ticker: string) => {
    setCurrentTicker(ticker);
    setHasSearched(true);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900'>ASX Company Information</h1>
            <p className='mt-2 text-lg text-gray-600'>Search for Australian Stock Exchange</p>
            <p className='text-lg text-gray-600'>listed companies</p>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {!hasResults ? (
          <div className='single-column max-w-2xl mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]'>
            <Search
              onSearch={handleSearch}
              currentTicker={currentTicker}
              loading={isLoading}
              error={error?.message || ''}
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-[minmax(350px,450px)_1fr] gap-8'>
            <div className='space-y-6'>
              <Search
                onSearch={handleSearch}
                currentTicker={currentTicker}
                loading={isLoading}
                error={error?.message || ''}
              />
              <KeyStatistics quoteData={quoteData || null} loading={quoteLoading} />
            </div>
            <div>
              <CompanyInfo companyData={companyInfo || null} loading={companyLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
