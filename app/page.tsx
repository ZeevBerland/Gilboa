"use client";

import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { SearchBar } from "@/components/SearchBar";
import { RestaurantCard } from "@/components/RestaurantCard";

export default function HomePage() {
  const { t, isHebrew } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useConvexAuth();

  const featured = useQuery(api.restaurants.featured, { limit: 12 });
  const types = useQuery(api.restaurants.getTypes);

  // Single batch query for favorite IDs
  const favoriteIds = useQuery(
    api.favorites.getUserFavoriteIds,
    isAuthenticated ? {} : "skip"
  );
  const favoriteSet = useMemo(
    () => new Set(favoriteIds ?? []),
    [favoriteIds]
  );

  const searchResults = useQuery(
    api.restaurants.searchByName,
    searchQuery.trim().length >= 2
      ? { query: searchQuery, lang: isHebrew ? "he" : "en" }
      : "skip"
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const showSearch = searchQuery.trim().length >= 2 && searchResults;
  const displayRestaurants = showSearch ? searchResults : featured;

  // Top cuisine types for the chip row
  const cuisineTypes = types ? (isHebrew ? types.he : types.en) : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern py-8 sm:py-12 md:py-16 text-center relative">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero image */}
          <div className="mb-4 sm:mb-5 flex justify-center">
            <Image
              src="/hero.png"
              alt="מדד גלבוע"
              width={480}
              height={240}
              className="w-64 sm:w-80 md:w-96 h-auto"
              priority
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-ink mb-1.5 sm:mb-2">
            {t("site.title")}
          </h1>
          <p className="text-sm sm:text-base text-body/70 mb-5 sm:mb-6 max-w-lg mx-auto px-2">
            {t("site.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Cuisine Category Chips */}
      {cuisineTypes.length > 0 && !showSearch && (
        <>
          <CuisineChipRow types={cuisineTypes.slice(0, 20)} isHebrew={isHebrew} allLabel={t("filter.all")} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-2 mb-1">
            <Link
              href="/restaurants"
              className="text-xs text-crimson hover:text-crimson-dark hover:underline transition-colors"
            >
              {isHebrew ? "עיין בכל המסעדות →" : "Browse all restaurants →"}
            </Link>
          </div>
        </>
      )}

      {/* Restaurant Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="text-2xl font-heading font-bold text-ink mb-4 sm:mb-6">
          {showSearch
            ? isHebrew
              ? `תוצאות חיפוש (${searchResults.length})`
              : `Search Results (${searchResults.length})`
            : t("featured.title")}
        </h2>

        {displayRestaurants === undefined ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
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
        ) : displayRestaurants.length === 0 ? (
          <p className="text-center text-muted py-12">
            {isHebrew ? "לא נמצאו תוצאות" : "No results found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {displayRestaurants.map((r) => (
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
                isFavorite={isAuthenticated ? favoriteSet.has(r._id as string) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---- Scrollable cuisine chip row with arrows + fade ---- */

const CuisineChipRow = memo(function CuisineChipRow({
  types,
  isHebrew,
  allLabel,
}: {
  types: string[];
  isHebrew: boolean;
  allLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (isHebrew) {
      setCanScrollStart(scrollLeft < -1);
      setCanScrollEnd(Math.abs(scrollLeft) + clientWidth < scrollWidth - 1);
    } else {
      setCanScrollStart(scrollLeft > 1);
      setCanScrollEnd(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, [isHebrew]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, types]);

  const scroll = (direction: "start" | "end") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 200;
    if (direction === "end") {
      el.scrollBy({ left: isHebrew ? -amount : amount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: isHebrew ? amount : -amount, behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-1">
      <div className="relative">
        {/* Fade — start */}
        {canScrollStart && (
          <div
            className={`absolute top-0 bottom-0 ${isHebrew ? "right-0" : "left-0"} w-10 z-10 pointer-events-none`}
            style={{
              background: isHebrew
                ? "linear-gradient(to left, transparent, white)"
                : "linear-gradient(to right, transparent, white)",
            }}
          />
        )}
        {canScrollStart && (
          <button
            onClick={() => scroll("start")}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-warm-gray shadow-sm flex items-center justify-center hover:bg-warm-white transition-colors ${isHebrew ? "right-0" : "left-0"}`}
            aria-label="Scroll back"
          >
            <svg className="w-3.5 h-3.5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isHebrew ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="chip-scroll"
          style={{
            paddingInlineStart: canScrollStart ? "2rem" : undefined,
            paddingInlineEnd: canScrollEnd ? "2rem" : undefined,
          }}
        >
          <Link
            href="/restaurants"
            className="text-sm px-4 py-2 rounded-full border border-crimson bg-crimson text-white whitespace-nowrap hover:bg-crimson-dark transition-colors"
          >
            {allLabel}
          </Link>
          {types.map((type) => (
            <Link
              key={type}
              href={`/restaurants?type=${encodeURIComponent(type)}`}
              className="text-sm px-4 py-2 rounded-full border border-warm-gray bg-white text-body whitespace-nowrap hover:border-crimson/40 hover:text-crimson transition-colors"
            >
              {type}
            </Link>
          ))}
        </div>

        {/* Fade — end */}
        {canScrollEnd && (
          <div
            className={`absolute top-0 bottom-0 ${isHebrew ? "left-0" : "right-0"} w-10 z-10 pointer-events-none`}
            style={{
              background: isHebrew
                ? "linear-gradient(to right, transparent, white)"
                : "linear-gradient(to left, transparent, white)",
            }}
          />
        )}
        {canScrollEnd && (
          <button
            onClick={() => scroll("end")}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-warm-gray shadow-sm flex items-center justify-center hover:bg-warm-white transition-colors ${isHebrew ? "left-0" : "right-0"}`}
            aria-label="Scroll forward"
          >
            <svg className="w-3.5 h-3.5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isHebrew ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
});
