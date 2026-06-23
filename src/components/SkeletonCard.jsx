export default function SkeletonCard({ className = "h-40" }) {
  return (
    <div className={`soft-panel overflow-hidden ${className}`}>
      <div className="shimmer h-full w-full animate-shimmer" />
    </div>
  );
}
