'use client';

interface TickerMetricsProps {
  label: string;
  value: string | number;
  formatter?: (value: number) => string;
  fallback?: string;
}

export default function TickerMetrics({
  label,
  value,
  formatter,
  fallback = '-'
}: TickerMetricsProps) {
  const displayValue =
    value === '' || value == null ? fallback : formatter ? formatter(value as number) : value;

  return (
    <dl>
      <dt className='text-xs text-gray-500'>{label}</dt>
      <dd className='text-sm font-semibold text-gray-900'>{displayValue}</dd>
    </dl>
  );
}
