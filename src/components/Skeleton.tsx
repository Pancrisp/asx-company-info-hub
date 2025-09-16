interface SkeletonProps {
  className?: string;
}

export function Skeleton({
  className = '',
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseClasses = 'animate-pulse rounded bg-gray-200';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return <div className={combinedClasses} {...props} />;
}
