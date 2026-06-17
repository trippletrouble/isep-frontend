export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
}
