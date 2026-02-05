"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { getYoutubeThumbnail } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { Id } from "@/convex/_generated/dataModel";

interface RestaurantCardProps {
  id: Id<"restaurants">;
  name: string;
  nameHe: string;
  slug: string;
  type: string;
  typeHe: string;
  address: string;
  madadNumber: number;
  videoId: string;
  userScore?: number;
  userReviewCount?: number;
  isFavorite?: boolean;
}

export const RestaurantCard = memo(function RestaurantCard({
  id,
  name,
  nameHe,
  slug,
  type,
  typeHe,
  address,
  madadNumber,
  videoId,
  userScore,
  userReviewCount,
  isFavorite,
}: RestaurantCardProps) {
  const { isHebrew, t } = useLanguage();

  const displayName = isHebrew ? nameHe || name : name || nameHe;
  const displayType = isHebrew ? typeHe || type : type || typeHe;

  return (
    <Link
      href={`/restaurants/${slug}`}
      className="group block bg-white rounded-xl shadow-sm overflow-hidden card-lift hover:shadow-md"
    >
      {/* === Mobile: horizontal layout === */}
      <div className="flex sm:hidden">
        {/* Square thumbnail */}
        <div className="relative w-28 h-28 shrink-0 bg-warm-gray">
          <Image
            src={getYoutubeThumbnail(videoId, "mqdefault")}
            alt={displayName}
            fill
            className="object-cover"
            sizes="112px"
          />
          {/* Favorite button */}
          {isFavorite !== undefined && (
            <div className="absolute top-1 end-1 z-10">
              <FavoriteButton restaurantId={id} isFavorite={isFavorite} size="sm" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="font-heading font-bold text-ink text-sm leading-tight line-clamp-2 group-hover:text-crimson transition-colors">
                {displayName}
              </h3>
              {madadNumber > 0 && (
                <div className="w-7 h-7 shrink-0 rounded-full bg-crimson text-white flex items-center justify-center text-[10px] font-bold">
                  {madadNumber % 1 === 0
                    ? madadNumber.toFixed(0)
                    : madadNumber.toFixed(1)}
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted mt-0.5 truncate">{address}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warm-white border border-warm-gray text-body">
              {displayType}
            </span>
            {userScore && userReviewCount ? (
              <span className="text-[10px] text-muted">
                {userScore.toFixed(1)} ({userReviewCount})
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* === Desktop/Tablet: vertical card === */}
      <div className="hidden sm:block">
        {/* Thumbnail 4:3 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-warm-gray">
          <Image
            src={getYoutubeThumbnail(videoId, "mqdefault")}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
            <div className="w-10 h-10 rounded-full bg-crimson/80 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
          {/* Favorite button */}
          {isFavorite !== undefined && (
            <div className="absolute top-2 end-2 z-10">
              <FavoriteButton restaurantId={id} isFavorite={isFavorite} size="sm" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 lg:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-ink text-sm lg:text-base truncate group-hover:text-crimson transition-colors">
                {displayName}
              </h3>
            </div>
            {/* Madad score badge */}
            {madadNumber > 0 && (
              <div className="w-8 h-8 shrink-0 rounded-full bg-crimson text-white flex items-center justify-center text-xs font-bold">
                {madadNumber % 1 === 0
                  ? madadNumber.toFixed(0)
                  : madadNumber.toFixed(1)}
              </div>
            )}
          </div>
          {/* Type + Address inline */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
            <span className="font-medium text-body/80">{displayType}</span>
            <span className="text-warm-gray">|</span>
            <span className="truncate">{address}</span>
          </div>

          {/* User score */}
          {userScore && userReviewCount ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-warm-white border border-warm-gray text-[10px] font-bold text-body">
                {userScore.toFixed(1)}
              </span>
              <span>
                {userReviewCount} {t("restaurant.reviews")}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
});
