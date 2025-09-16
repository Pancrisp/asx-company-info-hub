'use client';

import { useState } from 'react';
import { CompanyData } from '@/types/schema';

interface CompanyInfoProps {
  companyData: CompanyData | null;
}

export default function CompanyInfo({ companyData }: CompanyInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
