"use client";

import { use, useMemo } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/lib/language";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MadadBadge } from "@/components/MadadBadge";
import { UserScoreBadge } from "@/components/UserScoreBadge";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t, isHebrew, lang } = useLanguage();

  const { isAuthenticated } = useConvexAuth();
  const restaurant = useQuery(api.restaurants.getBySlug, { slug });
  const currentUser = useQuery(api.users.currentUser);
  const favoriteIds = useQuery(
    api.favorites.getUserFavoriteIds,
    isAuthenticated ? {} : "skip"
  );
  const favoriteSet = useMemo(
    () => new Set(favoriteIds ?? []),
    [favoriteIds]
  );

  if (restaurant === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="animate-pulse space-y-6">
          <div className="aspect-video bg-warm-gray rounded-xl" />
          <div className="h-8 bg-warm-gray rounded w-1/2" />
          <div className="h-4 bg-warm-gray rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-ink mb-4">
          {isHebrew ? "המסעדה לא נמצאה" : "Restaurant not found"}
        </h1>
        <Link
          href="/restaurants"
          className="text-crimson hover:underline text-sm"
        >
          {isHebrew ? "חזרה למסעדות" : "Back to restaurants"}
        </Link>
      </div>
    );
  }

  const displayName = isHebrew
    ? restaurant.nameHe || restaurant.name
    : restaurant.name || restaurant.nameHe;
  const displayDesc = isHebrew
    ? restaurant.descriptionHe || restaurant.description
    : restaurant.description || restaurant.descriptionHe;
  const displayType = isHebrew
    ? restaurant.typeHe || restaurant.type
    : restaurant.type || restaurant.typeHe;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb - scrollable on mobile */}
      <nav className="text-sm text-muted mb-3 sm:mb-5 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link href="/" className="hover:text-crimson transition-colors">
          {t("nav.home")}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/restaurants"
          className="hover:text-crimson transition-colors"
        >
          {t("nav.browse")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-body">{displayName}</span>
      </nav>

      {/* Video Player */}
      <VideoPlayer videoId={restaurant.videoId} title={displayName} />

      {/* Restaurant Info */}
      <div className="mt-6 sm:mt-8">
        {/* Mobile: scores row above the title */}
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <MadadBadge score={restaurant.madadNumber} size="sm" />
          <UserScoreBadge
            score={restaurant.userScore ?? undefined}
            reviewCount={restaurant.userReviewCount ?? undefined}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warm-white border border-warm-gray text-body">
                {displayType}
              </span>
              <span className="text-xs text-muted">
                {formatDate(restaurant.date, lang)}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 mt-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
                {displayName}
              </h1>
              {isAuthenticated && (
                <FavoriteButton
                  restaurantId={restaurant._id}
                  isFavorite={favoriteSet.has(restaurant._id as string)}
                  size="md"
                />
              )}
            </div>

            {/* Show both names if bilingual */}
            {restaurant.name && restaurant.nameHe && (
              <p className="text-sm text-muted mb-3">
                {isHebrew ? restaurant.name : restaurant.nameHe}
              </p>
            )}

            <p className="text-sm text-muted flex items-start gap-1.5 mb-4">
              <svg
                className="w-3.5 h-3.5 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="break-words">{restaurant.address}</span>
            </p>

            <p className="text-sm sm:text-base text-body leading-relaxed" dir="auto">
              {displayDesc}
            </p>
          </div>

          {/* Desktop: score sidebar */}
          <div className="hidden md:flex shrink-0 flex-col items-center gap-4 w-40">
            <MadadBadge score={restaurant.madadNumber} size="lg" />
            <UserScoreBadge
              score={restaurant.userScore ?? undefined}
              reviewCount={restaurant.userReviewCount ?? undefined}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 sm:my-8 border-warm-gray" />

      {/* Reviews Section */}
      <section>
        <h2 className="text-lg sm:text-xl font-heading font-bold text-ink mb-4 sm:mb-6">
          {t("restaurant.reviews")}
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Review form */}
          <ReviewForm
            restaurantId={restaurant._id}
            userId={currentUser?.id as unknown as string}
            userName={currentUser?.name}
          />

          {/* Review list */}
          <div>
            <ReviewList restaurantId={restaurant._id} />
          </div>
        </div>
      </section>
    </div>
  );
}
