'use client';

import { useState, FormEvent } from 'react';
import { SearchComponentProps } from '@/types';
import { isValidTicker, formatTicker } from '@/lib/api';

const POPULAR_STOCKS = ['CBA', 'NAB', 'BHP'];

export default function CompanySearch({
  onSearch,
  currentTicker,
  loading,
  error
}: SearchComponentProps) {
  const [inputValue, setInputValue] = useState(currentTicker);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ticker = formatTicker(inputValue);

    if (!ticker) {
      setValidationError('Please enter a ticker symbol');
      return;
    }

    if (!isValidTicker(ticker)) {
      setValidationError('Please enter a valid ticker (minimum 3 alphanumeric characters)');
      return;
    }

    setValidationError('');
    onSearch(ticker);
  };

  const handleInputChange = (value: string) => {
    // Auto-convert to uppercase and filter only alphanumeric characters
    const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInputValue(formattedValue);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handlePopularStockClick = (ticker: string) => {
    setInputValue(ticker);
    setValidationError('');
    onSearch(ticker);
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className='mb-6'>
        <div className='flex items-center bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden'>
          <div className='px-4 py-3 bg-gray-50 border-r border-gray-300'>
            <span className='text-gray-700 font-medium'>ASX:</span>
          </div>
          <input
            type='text'
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            placeholder='Enter ticker symbol'
            className='flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none'
            disabled={loading}
            maxLength={10}
          />
          <button
            type='submit'
            disabled={loading || !inputValue.trim()}
            className='px-6 py-3 bg-[#20705c] text-white font-medium hover:bg-[#1a5a4a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#20705c] focus:ring-offset-2'
          >
            {loading ? (
              <div className='flex items-center'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                Search
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Validation Error */}
        {validationError && <p className='mt-2 text-sm text-red-600'>{validationError}</p>}

        {/* API Error */}
        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
      </form>

      {/* Popular Stocks */}
      <div className='text-center'>
        <p className='text-gray-600 text-sm mb-3'>Popular stocks:</p>
        <div className='flex justify-center space-x-3'>
          {POPULAR_STOCKS.map(ticker => (
            <button
              key={ticker}
              onClick={() => handlePopularStockClick(ticker)}
              disabled={loading}
              className='px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-[#20705c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium'
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
