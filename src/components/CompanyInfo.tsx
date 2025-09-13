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

      {/* Ticker Display */}
      {companyData.ticker && (
        <div className='mt-4 pt-4 border-t border-gray-100'>
          <div className='flex items-center'>
            <span className='text-sm text-gray-500 mr-2'>Ticker:</span>
            <span className='text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded'>
              {companyData.ticker.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
