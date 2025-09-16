'use client';

export default function EmptyState() {
  return (
    <div className='flex min-h-[400px] flex-col justify-center rounded-lg border border-gray-200 bg-white p-8 text-center'>
      <div className='mx-auto max-w-sm'>
        <div className='mx-auto mb-8 flex h-32 w-48 items-center justify-center rounded-lg bg-gray-100'>
          <div className='text-center text-gray-400'>
            <div className='mb-1 text-sm font-medium'>Empty state infographic</div>
            <div className='text-xs'>Insert an image here</div>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='font-medium text-gray-600'>Select a stock from the left to get started</p>
          <p className='text-sm text-gray-500'>OR</p>
          <p className='font-medium text-gray-600'>Press / to search</p>
        </div>
      </div>
    </div>
  );
}
