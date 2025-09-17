'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, BookmarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onAddStocks?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class WatchlistErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WatchlistErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleAddStocks = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onAddStocks) {
      this.props.onAddStocks();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>Watchlist</h2>
          <div className='overflow-hidden rounded-md border border-red-200 bg-white'>
            <div className='p-6 bg-red-50'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <ExclamationTriangleIcon className='h-6 w-6 text-red-400' aria-hidden='true' />
                </div>
                <div className='ml-3 flex-1'>
                  <h3 className='text-base font-medium text-red-800'>
                    Watchlist unavailable
                  </h3>
                  <p className='mt-2 text-sm text-red-700'>
                    There was an error loading your watchlist. This could be due to corrupted local storage,
                    network issues, or problems fetching stock data.
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
                    {this.props.onAddStocks && (
                      <button
                        type='button'
                        onClick={this.handleAddStocks}
                        className='inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                      >
                        <PlusIcon className='mr-2 h-4 w-4' aria-hidden='true' />
                        Start fresh watchlist
                      </button>
                    )}
                  </div>
                  <div className='mt-4 p-3 bg-white rounded border border-red-200'>
                    <div className='text-xs text-red-600 space-y-2'>
                      <p>
                        <strong>Recovery options:</strong>
                      </p>
                      <ul className='list-disc list-inside space-y-1 ml-2'>
                        <li>Use the search bar above to find and bookmark stocks manually</li>
                        <li>Select stocks from the trending list and add them with <BookmarkIcon className='inline h-3 w-3' /></li>
                        <li>Try clearing your browser cache if the problem persists</li>
                      </ul>
                    </div>
                  </div>
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

export default WatchlistErrorBoundary;