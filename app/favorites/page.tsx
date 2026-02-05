"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/lib/language";
import { RestaurantCard } from "@/components/RestaurantCard";
import Link from "next/link";

export default function FavoritesPage() {
  const { t, isHebrew } = useLanguage();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const favorites = useQuery(
    api.favorites.getUserFavorites,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-warm-gray rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-warm-gray/60 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-warm-gray" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-warm-gray rounded w-3/4" />
                  <div className="h-3 bg-warm-gray rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <svg
          className="w-12 h-12 mx-auto text-muted mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h1 className="text-2xl font-heading font-bold text-ink mb-2">
          {t("favorites.title")}
        </h1>
        <p className="text-muted text-sm mb-6">{t("favorites.signIn")}</p>
        <Link
          href="/auth/sign-in"
          className="inline-block px-6 py-2.5 rounded-lg bg-crimson text-white text-sm font-medium hover:bg-crimson-dark transition-colors"
        >
          {t("nav.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mb-4 sm:mb-6">
        {t("favorites.title")}
      </h1>

      {favorites === undefined ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-warm-gray/60 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-warm-gray" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-warm-gray rounded w-3/4" />
                <div className="h-3 bg-warm-gray rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-12 h-12 mx-auto text-warm-gray mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-muted text-sm mb-4">{t("favorites.empty")}</p>
          <Link
            href="/restaurants"
            className="text-crimson text-sm hover:underline transition-colors"
          >
            {t("nav.browse")} →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-3 sm:mb-4">
            {isHebrew
              ? `${favorites.length} מועדפים`
              : `${favorites.length} favorites`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {favorites.map((r) => (
              <RestaurantCard
                key={r._id}
                id={r._id}
                name={r.name}
                nameHe={r.nameHe}
                slug={r.slug}
                type={r.type}
                typeHe={r.typeHe}
                address={r.address}
                madadNumber={r.madadNumber}
                videoId={r.videoId}
                userScore={r.userScore ?? undefined}
                userReviewCount={r.userReviewCount ?? undefined}
                isFavorite={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
