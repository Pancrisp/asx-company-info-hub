'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption
} from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

import { POPULAR_STOCKS } from '@/data/stocks';
import { Stock } from '@/types/schema';
import { isValidTicker, formatTicker } from '@/lib/api';

interface SearchComponentProps {
  onSearch: (ticker: string) => void;
  loading: boolean;
  error: string;
}

export default function Search({ onSearch, loading, error }: SearchComponentProps) {
  const [validationError, setValidationError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [pendingClear, setPendingClear] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && inputRef.current && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredStocks =
    inputValue === ''
      ? POPULAR_STOCKS
      : POPULAR_STOCKS.filter(
          stock =>
            stock.ticker.toLowerCase().includes(inputValue.toLowerCase()) ||
            stock.name.toLowerCase().includes(inputValue.toLowerCase())
        );

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      return;
    }

    if (e.key !== 'Enter') return;

    const stock = formatTicker(inputValue);

    if (!stock) {
      setValidationError('Please enter a ticker symbol');
      return;
    }

    if (!isValidTicker(stock)) {
      setValidationError('Please enter a valid ticker (minimum 3 alphanumeric characters)');
      return;
    }

    setValidationError('');
    onSearch(stock);
    // Defer clearing the input until the search completes
    setPendingClear(true);
  };

  const handleInputChange = (value: string) => {
    const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    setInputValue(formattedValue);
    setSelectedStock(null);

    if (validationError) {
      setValidationError('');
    }
  };

  const handleStockSelect = (stock: Stock | null) => {
    if (!stock) return;

    setSelectedStock(stock);
    setInputValue(stock.ticker);
    setValidationError('');

    const ticker = formatTicker(stock.ticker);
    if (ticker && isValidTicker(ticker)) {
      onSearch(ticker);
      // Mark to clear once loading finishes
      setPendingClear(true);
    }
  };

  // Clear the input and selection once a search completes successfully
  useEffect(() => {
    if (!loading && pendingClear && !error) {
      setInputValue('');
      setSelectedStock(null);
      setPendingClear(false);
    }
  }, [loading, pendingClear, error]);

  return (
    <div className='mx-auto w-full max-w-sm'>
      <Combobox immediate value={selectedStock} onChange={handleStockSelect}>
        <div className='relative'>
          <ComboboxInput
            ref={inputRef}
            className='w-full rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500'
            displayValue={(stock: Stock) => stock?.ticker || inputValue}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => handleSearch(e)}
            placeholder='Search for ticker'
            disabled={loading}
          />

          <ComboboxButton className='group absolute inset-y-0 right-0 px-3 py-3 text-gray-500'>
            <MagnifyingGlassIcon className='size-5' />
          </ComboboxButton>

          <ComboboxOptions className='absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {filteredStocks.length === 0 ? (
              <ComboboxOption
                key={inputValue}
                className='flex min-h-[44px] w-full cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-b-0 data-[focus]:bg-gray-50'
                value={inputValue}
              >
                <p className='text-gray-900'>
                  Search for ticker <strong>{inputValue}</strong>
                </p>
              </ComboboxOption>
            ) : (
              filteredStocks.map(stock => (
                <ComboboxOption
                  key={stock.ticker}
                  className='flex min-h-[44px] w-full cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-b-0 data-[focus]:bg-gray-50'
                  value={stock}
                >
                  <strong className='text-gray-900'>{stock.ticker}</strong>
                  <small className='text-gray-600'>{stock.name}</small>
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {validationError && (
        <p id='search-error' className='mt-2 text-sm text-red-600' role='alert'>
          {validationError}
        </p>
      )}

      {error && (
        <p id='search-error' className='mt-2 text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
