'use client';

import { useState } from 'react';
import { CompanyData } from '@/types/schema';
import LoadingSpinner from '../../components/LoadingSpinner';

interface CompanyInfoProps {
  companyData: CompanyData | null;
  loading: boolean;
}

export default function CompanyInfo({ companyData, loading }: CompanyInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Company Information</h2>
        <LoadingSpinner text='Loading company information...' />
      </div>
    );
  }

  if (!companyData || !companyData.company_info) {
    return null;
  }

  const description = companyData.company_info;
  const shouldTruncate = description.length > 200;
  const truncatedDescription = shouldTruncate
    ? description.substring(0, 200).trim() + '...'
    : description;

  const displayDescription = isExpanded || !shouldTruncate ? description : truncatedDescription;

  return (
    <section className='mt-4 border-t border-gray-200 pt-4'>
      <div className='leading-relaxed text-gray-700'>
        <p className='text-sm whitespace-pre-wrap'>{displayDescription}</p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 focus:underline focus:outline-none'
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    </section>
  );
}
