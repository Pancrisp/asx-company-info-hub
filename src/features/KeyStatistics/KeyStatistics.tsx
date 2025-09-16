'use client';

import { Fragment } from 'react';
import { QuoteData, CompanyData } from '@/types/schema';
import TickerCard from './TickerCard';

interface KeyStatisticsProps {
  quoteData: QuoteData | null;
  loading: boolean;
  companyData: CompanyData | null;
  showEmptyState?: boolean;
}

export default function KeyStatistics({
  quoteData,
  loading,
  companyData,
  showEmptyState = false
}: KeyStatisticsProps) {
  return (
    <Fragment>
      <header className='mb-4'>
        <h1 className='text-lg font-semibold text-gray-900'>Stock details</h1>
      </header>
      <TickerCard
        quoteData={quoteData}
        loading={loading}
        companyData={companyData}
        showEmptyState={showEmptyState}
      />
    </Fragment>
  );
}
