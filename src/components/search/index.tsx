'use client';

import { useState, FormEvent, useRef, useEffect, useMemo, useCallback } from 'react';

import { POPULAR_STOCKS } from '@/data/stocks';
import { Stock } from '@/types/schema';
import { SearchComponentProps } from '@/types/props';
import { isValidTicker, formatTicker } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';

import SearchInput from './SearchInput';
import SearchDropdown from './SearchDropdown';

export default function Search({ onSearch, currentTicker, loading, error }: SearchComponentProps) {
  const [validationError, setValidationError] = useState('');
  const [inputValue, setInputValue] = useState(currentTicker);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filterQuery, setFilterQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null!);

  const debouncedFilterQuery = useDebounce(filterQuery, 500);
  const filteredStocks = useMemo(() => {
    if (!debouncedFilterQuery.trim()) {
      return POPULAR_STOCKS;
    }

    const query = debouncedFilterQuery.toLowerCase();
    return POPULAR_STOCKS.filter(
      stock =>
        stock.ticker.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query)
    );
  }, [debouncedFilterQuery]);

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
    setIsDropdownOpen(false);
    onSearch(ticker);
  };

  const handleInputChange = (value: string) => {
    // Auto-convert to uppercase and filter only alphanumeric characters
    const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInputValue(formattedValue);
    setFilterQuery(formattedValue);
    setHighlightedIndex(-1);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleStockSelect = useCallback(
    (stock: Stock) => {
      setInputValue(stock.ticker);
      setValidationError('');
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      onSearch(stock.ticker);
    },
    [onSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredStocks.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredStocks.length) {
          handleStockSelect(filteredStocks[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='w-full max-w-md mx-auto relative'>
      <SearchInput
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        loading={loading}
        isDropdownOpen={isDropdownOpen}
        highlightedIndex={highlightedIndex}
        validationError={validationError}
        error={error}
        inputRef={inputRef}
      />
      <SearchDropdown
        isOpen={isDropdownOpen}
        stocks={filteredStocks}
        highlightedIndex={highlightedIndex}
        onStockSelect={handleStockSelect}
        onHighlightChange={setHighlightedIndex}
        filterQuery={debouncedFilterQuery}
        dropdownRef={dropdownRef}
      />
    </div>
  );
}
