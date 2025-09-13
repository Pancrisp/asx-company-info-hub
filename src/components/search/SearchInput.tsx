'use client';

import { SearchInputProps } from '@/types/props';

export default function SearchInput({
  inputValue,
  onInputChange,
  onSubmit,
  onFocus,
  onKeyDown,
  loading,
  isDropdownOpen,
  highlightedIndex,
  validationError,
  error,
  inputRef
}: SearchInputProps) {
  return (
    <form onSubmit={onSubmit} className='mb-6'>
      <div className='flex items-center bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden'>
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder='Enter ticker symbol'
          className='flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none'
          disabled={loading}
          maxLength={10}
          role='combobox'
          aria-controls='stock-listbox'
          aria-expanded={isDropdownOpen}
          aria-autocomplete='list'
          aria-haspopup='listbox'
          aria-describedby={validationError || error ? 'search-error' : undefined}
          aria-activedescendant={
            highlightedIndex >= 0 ? `stock-option-${highlightedIndex}` : undefined
          }
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
      {validationError && (
        <p id='search-error' className='mt-2 text-sm text-red-600' role='alert'>
          {validationError}
        </p>
      )}

      {/* API Error */}
      {error && (
        <p id='search-error' className='mt-2 text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </form>
  );
}
