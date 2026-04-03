import React from 'react';

export function SkeletonCard({ height = 120 }) {
  return (
    <div className="skeleton-card" style={{ height, borderRadius: 16, marginBottom: 12 }} />
  );
}

export function SkeletonList({ count = 3, height = 80 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </>
  );
}
