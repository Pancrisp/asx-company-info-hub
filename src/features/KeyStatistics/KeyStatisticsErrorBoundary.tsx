'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onClearSearch?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class KeyStatisticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KeyStatisticsErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleClearSearch = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onClearSearch) {
      this.props.onClearSearch();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <header className='mb-4'>
            <h1 className='text-lg font-semibold text-gray-900'>Stock details</h1>
          </header>
          <div className='rounded-lg border border-red-200 bg-red-50 p-6'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <ExclamationTriangleIcon className='h-6 w-6 text-red-400' aria-hidden='true' />
              </div>
              <div className='ml-3 flex-1'>
                <h3 className='text-base font-medium text-red-800'>
                  Unable to load stock details
                </h3>
                <p className='mt-2 text-sm text-red-700'>
                  There was an error loading the stock information. This could be due to an invalid ticker symbol,
                  network issues, or temporary data unavailability.
                </p>
                <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
                  <button
                    type='button'
                    onClick={this.handleRetry}
                    className='inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  >
                    <ArrowPathIcon className='mr-2 h-4 w-4' aria-hidden='true' />
                    Try again
                  </button>
                  {this.props.onClearSearch && (
                    <button
                      type='button'
                      onClick={this.handleClearSearch}
                      className='inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                    >
                      <MagnifyingGlassIcon className='mr-2 h-4 w-4' aria-hidden='true' />
                      Search different stock
                    </button>
                  )}
                </div>
                <div className='mt-4 text-xs text-red-600'>
                  <p>
                    <strong>Tip:</strong> Try searching for popular ASX stocks like CBA, BHP, or WOW,
                    or select from the trending stocks list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default KeyStatisticsErrorBoundary;