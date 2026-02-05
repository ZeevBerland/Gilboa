"use client";

import { useLanguage } from "@/lib/language";

export function UserScoreBadge({
  score,
  reviewCount,
}: {
  score?: number;
  reviewCount?: number;
}) {
  const { t } = useLanguage();
  const count = reviewCount ?? 0;

  if (!score || count === 0) {
    return (
      <span className="text-xs text-muted">
        {t("restaurant.noReviews")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warm-white border border-warm-gray text-sm font-bold text-body">
        {score.toFixed(1)}
      </span>
      <span className="text-xs text-muted">
        ({count} {t("restaurant.reviews")})
      </span>
    </div>
  );
}
