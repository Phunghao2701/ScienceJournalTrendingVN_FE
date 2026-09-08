
/**
 * LoadingSkeleton Component
 * Renders an animated placeholder shimmer block.
 */
export default function LoadingSkeleton({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px', 
  className = '' 
}) {
  return (
    <div 
      className={`skeleton-shimmer ${className}`} 
      style={{ 
        width, 
        height, 
        borderRadius,
        display: 'inline-block'
      }} 
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="tvn-article-card p-3 mb-2">
      <div className="d-flex align-items-start gap-2">
        <LoadingSkeleton width="20px" height="20px" borderRadius="50%" />
        <div className="flex-grow-1 min-w-0">
          <LoadingSkeleton width="85%" height="1.2rem" className="mb-2" />
          <div className="d-flex gap-2 mb-2">
            <LoadingSkeleton width="120px" height="0.8rem" />
            <LoadingSkeleton width="80px" height="0.8rem" />
          </div>
          <LoadingSkeleton width="60%" height="0.8rem" className="mb-2" />
          <div className="d-flex gap-2 mt-2">
            <LoadingSkeleton width="60px" height="22px" borderRadius="4px" />
            <LoadingSkeleton width="75px" height="22px" borderRadius="4px" />
            <LoadingSkeleton width="90px" height="22px" borderRadius="4px" />
          </div>
        </div>
      </div>
    </div>
  );
}
