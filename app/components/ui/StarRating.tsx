import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewsCount?: number;
  size?: number;
}

export default function StarRating({ rating, reviewsCount, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400" role="img" aria-label={`Note de ${rating.toFixed(1)} sur 5`}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                size={size}
                className="fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <Star size={size} className="text-slate-300" aria-hidden="true" />
                <div
                  className="absolute top-0 left-0 overflow-hidden text-amber-400"
                  style={{ width: "50%" }}
                >
                  <Star size={size} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                </div>
              </div>
            );
          }
          return <Star key={i} size={size} className="text-slate-300" aria-hidden="true" />;
        })}
      </div>
      <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>
      {reviewsCount !== undefined && (
        <span className="text-xs text-slate-400">({reviewsCount})</span>
      )}
    </div>
  );
}