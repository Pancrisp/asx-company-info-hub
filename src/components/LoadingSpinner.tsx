'use client';

import { LoadingSpinnerProps } from '@/types';

export default function LoadingSpinner({ text = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className='flex flex-col items-center justify-center py-8'>
      <div className='w-8 h-8 border-4 border-gray-200 border-t-[#20705c] rounded-full animate-spin mb-3'></div>
      <p className='text-gray-600 text-sm'>{text}</p>
    </div>
  );
}
