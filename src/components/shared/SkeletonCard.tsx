interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
  )
}
