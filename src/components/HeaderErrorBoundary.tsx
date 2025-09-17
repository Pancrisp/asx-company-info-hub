'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class HeaderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HeaderErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <header className='border-b border-gray-200 bg-white shadow-sm'>
          <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between gap-4'>
              <h1 className='text-3xl font-bold text-gray-900'>ASX Company Information</h1>
              <div className='w-full max-w-sm'>
                <div className='flex items-center justify-center rounded-md border border-red-300 bg-red-50 p-3'>
                  <ExclamationTriangleIcon className='h-5 w-5 text-red-500 mr-2' />
                  <span className='text-sm text-red-700'>Search temporarily unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }

    return this.props.children;
  }
}

export default HeaderErrorBoundary;