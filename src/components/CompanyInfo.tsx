'use client';

import { CompanyInfoProps } from '@/types/props';
import LoadingSpinner from './LoadingSpinner';

export default function CompanyInfo({ companyData, loading }: CompanyInfoProps) {
  if (loading) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Company Information</h2>
        <LoadingSpinner text='Loading company information...' />
      </div>
    );
  }

  if (!companyData) {
    return null;
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2'>
        Company Information
      </h2>

      <div className='prose prose-gray max-w-none'>
        <div className='text-gray-700 leading-relaxed'>
          {companyData.company_info ? (
            <p className='text-base whitespace-pre-wrap'>{companyData.company_info}</p>
          ) : (
            <p className='text-gray-500 italic'>No company information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
