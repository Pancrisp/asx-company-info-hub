'use client';

import { useState } from 'react';
import CompanySearch from '@/components/CompanySearch';
import KeyStatistics from '@/components/KeyStatistics';
import CompanyInfo from '@/components/CompanyInfo';
import { AppState } from '@/types';
import { fetchCompanyData, ApiError } from '@/lib/api';

export default function Home() {
  const [state, setState] = useState<AppState>({
    loading: false,
    error: '',
    companyData: null,
    quoteData: null,
    currentTicker: ''
  });

  const handleSearch = async (ticker: string) => {
    setState(prevState => ({
      ...prevState,
      loading: true,
      error: '',
      currentTicker: ticker
    }));

    try {
      const { company, quote } = await fetchCompanyData(ticker);

      setState(prevState => ({
        ...prevState,
        loading: false,
        companyData: company,
        quoteData: quote,
        error: ''
      }));
    } catch (error) {
      console.error('Search error:', error);

      let errorMessage = 'Failed to fetch company information. Please try again later.';

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      setState(prevState => ({
        ...prevState,
        loading: false,
        companyData: null,
        quoteData: null,
        error: errorMessage
      }));
    }
  };

  const hasResults = state.companyData || state.quoteData;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900'>ASX Company Information</h1>
            <p className='mt-2 text-lg text-gray-600'>Search for Australian Stock Exchange</p>
            <p className='text-lg text-gray-600'>listed companies</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {!hasResults ? (
          // Initial centered search layout
          <div className='single-column max-w-2xl mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]'>
            <CompanySearch
              onSearch={handleSearch}
              currentTicker={state.currentTicker}
              loading={state.loading}
              error={state.error}
            />
          </div>
        ) : (
          // Two-column layout after search
          <div className='grid grid-cols-1 lg:grid-cols-[minmax(350px,450px)_1fr] gap-8'>
            {/* Left Column */}
            <div className='space-y-6'>
              <CompanySearch
                onSearch={handleSearch}
                currentTicker={state.currentTicker}
                loading={state.loading}
                error={state.error}
              />
              <KeyStatistics quoteData={state.quoteData} loading={state.loading} />
            </div>

            {/* Right Column */}
            <div>
              <CompanyInfo companyData={state.companyData} loading={state.loading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
