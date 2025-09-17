'use client';

interface WatchlistRangeBarProps {
  current: number;
  low: number;
  high: number;
}

export default function WatchlistRangeBar({ current, low, high }: WatchlistRangeBarProps) {
  const percentage = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100));

  const getBarColor = (pos: number) => {
    if (pos <= 33) return 'var(--negative-red)';
    if (pos < 66) return 'var(--neutral-yellow)';
    return 'var(--positive-green)';
  };

  const getRangeLevel = (pos: number) => {
    if (pos <= 33) return 'low';
    if (pos < 66) return 'mid';
    return 'high';
  };

  const barColor = getBarColor(percentage);
  const rangeLevel = getRangeLevel(percentage);

  return (
    <div
      className='flex w-full items-center'
      title={`${percentage.toFixed(0)}% of 52w range`}
      data-testid="range-bar-container"
      data-range-level={rangeLevel}
      data-percentage={percentage.toFixed(0)}
    >
      <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
        <div
          className='absolute top-0 left-0 h-full rounded-full transition-all duration-200'
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor
          }}
          data-testid="range-bar-fill"
          data-range-level={rangeLevel}
        />
      </div>
    </div>
  );
}
