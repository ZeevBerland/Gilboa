"use client";

import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/lib/language";
import { SearchBar } from "@/components/SearchBar";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FilterBar } from "@/components/FilterBar";

const PAGE_SIZE = 24;

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-warm-gray rounded w-48" />
            <div className="h-10 bg-warm-gray rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-warm-gray/60 overflow-hidden"
                >
                  <div className="aspect-video bg-warm-gray" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-warm-gray rounded w-3/4" />
                    <div className="h-3 bg-warm-gray rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}

function BrowsePageContent() {
  const { t, isHebrew } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();

  // Single batch query for all favorite IDs (only when logged in)
  const favoriteIds = useQuery(
    api.favorites.getUserFavoriteIds,
    isAuthenticated ? {} : "skip"
  );
  const favoriteSet = useMemo(
    () => new Set(favoriteIds ?? []),
    [favoriteIds]
  );

  // ---- URL-driven filters ----
  const urlType = searchParams.get("type");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    urlType ? [urlType] : []
  );
  const [madadRange, setMadadRange] = useState<[number, number]>([0, 10]);
  const [sortBy, setSortBy] = useState<"madad" | "userScore" | "date">(
    "madad"
  );

  // Sync URL type param on first load or when URL changes
  useEffect(() => {
    if (urlType && !selectedTypes.includes(urlType)) {
      setSelectedTypes([urlType]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlType]);

  // Sync URL whenever selectedTypes changes (after render, not during)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTypes.length === 1) {
      params.set("type", selectedTypes[0]);
    }
    const newUrl =
      params.toString() ? `/restaurants?${params.toString()}` : "/restaurants";
    const currentUrl =
      searchParams.toString()
        ? `/restaurants?${searchParams.toString()}`
        : "/restaurants";
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedTypes, router, searchParams]);

  const allRestaurants = useQuery(api.restaurants.list, { sortBy });
  const types = useQuery(api.restaurants.getTypes);

  const searchResults = useQuery(
    api.restaurants.searchByName,
    searchQuery.trim().length >= 2
      ? { query: searchQuery, lang: isHebrew ? "he" : "en" }
      : "skip"
  );

  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleClearTypes = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    const base =
      searchQuery.trim().length >= 2 && searchResults
        ? searchResults
        : allRestaurants ?? [];

    return base.filter((r) => {
      // Type filter
      if (selectedTypes.length > 0) {
        const rType = isHebrew ? r.typeHe : r.type;
        if (!selectedTypes.includes(rType)) return false;
      }
      // Madad range
      if (r.madadNumber < madadRange[0] || r.madadNumber > madadRange[1]) {
        return false;
      }
      return true;
    });
  }, [
    allRestaurants,
    searchResults,
    searchQuery,
    selectedTypes,
    madadRange,
    isHebrew,
  ]);

  const displayTypes = types
    ? isHebrew
      ? types.he
      : types.en
    : [];

  // ---- Incremental rendering: show cards in batches ----
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedTypes, madadRange, sortBy]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered]);

  const visibleItems = useMemo(
    () => (filtered ?? []).slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = (filtered?.length ?? 0) > visibleCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mb-4 sm:mb-6">
        {t("browse.title")}
      </h1>

      {/* Sticky Search + Filter Bar */}
      <div className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-warm-gray/50 shadow-sm mb-5">
        <div className="mb-3">
          <SearchBar onSearch={handleSearch} />
        </div>
        <FilterBar
          types={displayTypes}
          selectedTypes={selectedTypes}
          onTypeToggle={handleTypeToggle}
          onClearTypes={handleClearTypes}
          madadRange={madadRange}
          onMadadRangeChange={setMadadRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Restaurant Grid */}
      {filtered === undefined || allRestaurants === undefined ? (
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
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted py-12 sm:py-16">
          {isHebrew ? "לא נמצאו תוצאות" : "No results found"}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted mb-3 sm:mb-4">
            {isHebrew
              ? `${filtered.length} מסעדות`
              : `${filtered.length} restaurants`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {visibleItems.map((r) => (
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
          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <div className="animate-pulse text-sm text-muted">
                {isHebrew ? "טוען עוד..." : "Loading more..."}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
