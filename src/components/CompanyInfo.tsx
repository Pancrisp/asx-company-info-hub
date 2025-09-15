'use client';

import { useState } from 'react';
import { CompanyData } from '@/types/schema';
import LoadingSpinner from './LoadingSpinner';

interface CompanyInfoProps {
  companyData: CompanyData | null;
  loading: boolean;
}

export default function CompanyInfo({ companyData, loading }: CompanyInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Company Information</h2>
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
    <section className='mt-4 pt-4 border-t border-gray-200'>
      <div className='text-gray-700 leading-relaxed'>
        <p className='text-sm whitespace-pre-wrap'>{displayDescription}</p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline cursor-pointer'
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    </section>
  );
}
