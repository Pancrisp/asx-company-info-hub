'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class TrendingStocksErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TrendingStocksErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>Trending stocks</h2>
          <div className='rounded-md border border-red-200 bg-red-50 p-6'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <ExclamationTriangleIcon className='h-5 w-5 text-red-400' aria-hidden='true' />
              </div>
              <div className='ml-3 flex-1'>
                <h3 className='text-sm font-medium text-red-800'>
                  Unable to load trending stocks
                </h3>
                <p className='mt-1 text-sm text-red-700'>
                  There was an error loading the trending stocks data. You can still search for specific companies above.
                </p>
                <div className='mt-4'>
                  <button
                    type='button'
                    onClick={this.handleRetry}
                    className='inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  >
                    <ArrowPathIcon className='mr-2 h-4 w-4' aria-hidden='true' />
                    Try again
                  </button>
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

export default TrendingStocksErrorBoundary;