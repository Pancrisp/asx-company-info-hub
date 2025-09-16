'use client';

import { ReactNode } from 'react';

interface TickerCardProps {
  children: ReactNode;
  className?: string;
}

export default function TickerCard({ children, className = '' }: TickerCardProps) {
  return (
    <article
      aria-label='Card for ticker data'
      className={`rounded-md border border-gray-300 bg-white p-6 ${className}`}
    >
      {children}
    </article>
  );
}