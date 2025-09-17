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
    requestAnimationFrame(() => {
      setInputValue('');
      setSelectedStock(null);
      inputRef.current?.blur();
    });
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
      setInputValue('');
      setSelectedStock(null);
    }
  };

  return (
    <div className='mx-auto w-full max-w-sm'>
      <Combobox immediate value={selectedStock} onChange={handleStockSelect}>
        <div className='relative'>
          <ComboboxButton className='group absolute inset-y-0 left-0 px-3 py-3 text-gray-500'>
            <MagnifyingGlassIcon className='size-5' />
          </ComboboxButton>

          <ComboboxInput
            ref={inputRef}
            className='w-full rounded-md border border-gray-300 py-3 pr-16 pl-10 text-sm text-gray-900 placeholder-gray-500'
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => handleSearch(e)}
            placeholder='Search for an ASX stock'
            disabled={loading}
          />

          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
            <span className='text-sm text-gray-400'>
              <kbd className='inline-flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs font-medium text-gray-600'>
                /
              </kbd>
            </span>
          </div>

          <ComboboxOptions
            transition
            className='absolute top-full right-0 left-0 z-50 mt-1 max-h-74 origin-top overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg transition duration-100 ease-out [-ms-overflow-style:none] [scrollbar-width:none] empty:invisible data-closed:scale-95 data-closed:opacity-0 [&::-webkit-scrollbar]:hidden'
          >
            {filteredStocks.length === 0 ? (
              <ComboboxOption
                key={inputValue}
                className='flex min-h-[44px] w-full cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-b-0 data-[focus]:bg-gray-50'
                value={{ ticker: inputValue, name: inputValue }}
              >
                <p className='text-gray-900'>
                  Search for <strong>{inputValue}</strong> ticker symbol
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
