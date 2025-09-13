'use client';

import { useEffect } from 'react';
import { SearchDropdownProps } from '@/types/props';

export default function SearchDropdown({
  isOpen,
  stocks,
  highlightedIndex,
  onStockSelect,
  onHighlightChange,
  filterQuery,
  dropdownRef
}: SearchDropdownProps) {
  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && isOpen) {
      const highlightedElement = document.getElementById(`stock-option-${highlightedIndex}`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: 'instant',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50'
    >
      {stocks.length > 0 ? (
        <ul
          id='stock-listbox'
          role='listbox'
          aria-label='Popular stocks'
          className='list-none m-0 p-0'
        >
          {stocks.map((stock, index) => (
            <li
              key={stock.ticker}
              id={`stock-option-${index}`}
              role='option'
              aria-selected={index === highlightedIndex}
              onClick={() => onStockSelect(stock)}
              onMouseEnter={() => onHighlightChange(index)}
              className={`w-full text-left flex justify-between items-center px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 min-h-[44px] cursor-pointer ${
                index === highlightedIndex ? 'bg-gray-50' : ''
              }`}
            >
              <strong className='text-gray-900'>{stock.ticker}</strong>
              <small className='text-gray-600'>{stock.name}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className='px-4 py-3 text-gray-500 text-sm m-0'>
          No stocks found matching &ldquo;{filterQuery}&rdquo;
        </p>
      )}
    </div>
  );
}
