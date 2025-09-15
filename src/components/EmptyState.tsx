'use client';

export default function EmptyState() {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-8 text-center min-h-[400px] flex flex-col justify-center'>
      <div className='max-w-sm mx-auto'>
        {/* Placeholder for infographic */}
        <div className='w-48 h-32 mx-auto mb-8 bg-gray-100 rounded-lg flex items-center justify-center'>
          <div className='text-gray-400 text-center'>
            <div className='text-sm font-medium mb-1'>Empty state infographic</div>
            <div className='text-xs'>Insert an image here</div>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-gray-600 font-medium'>Select a stock from the left to get started</p>
          <p className='text-gray-500 text-sm'>OR</p>
          <p className='text-gray-600 font-medium'>Press</p>
          <span>/</span>
          <p>to search</p>
        </div>
      </div>
    </div>
  );
}
