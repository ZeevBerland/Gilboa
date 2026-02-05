"use client";

import { memo, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/lib/language";

interface FilterBarProps {
  types: string[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  onClearTypes: () => void;
  madadRange: [number, number];
  onMadadRangeChange: (range: [number, number]) => void;
  sortBy: "madad" | "userScore" | "date";
  onSortChange: (sort: "madad" | "userScore" | "date") => void;
}

const MADAD_PRESETS: {
  label: string;
  labelHe: string;
  range: [number, number];
}[] = [
  { label: "All", labelHe: "הכל", range: [0, 10] },
  { label: "9+", labelHe: "9+", range: [9, 10] },
  { label: "8+", labelHe: "8+", range: [8, 10] },
  { label: "7+", labelHe: "7+", range: [7, 10] },
  { label: "6+", labelHe: "6+", range: [6, 10] },
  { label: "< 6", labelHe: "< 6", range: [0, 6] },
];

export const FilterBar = memo(function FilterBar({
  types,
  selectedTypes,
  onTypeToggle,
  onClearTypes,
  madadRange,
  onMadadRangeChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const { t, isHebrew } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isRTL = isHebrew;
    // In RTL, scrollLeft is negative (or 0 at start) in most browsers
    if (isRTL) {
      // scrollLeft is 0 at right edge (start), negative as you scroll left (end)
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

  const activePreset = useMemo(
    () =>
      MADAD_PRESETS.findIndex(
        (p) => p.range[0] === madadRange[0] && p.range[1] === madadRange[1]
      ),
    [madadRange]
  );

  const hasActiveFilters = useMemo(
    () => selectedTypes.length > 0 || madadRange[0] > 0 || madadRange[1] < 10,
    [selectedTypes, madadRange]
  );

  const handleClearAll = useCallback(() => {
    onClearTypes();
    onMadadRangeChange([0, 10]);
  }, [onClearTypes, onMadadRangeChange]);

  return (
    <div className="space-y-3">
      {/* Row 1: Sort + Madad dropdowns */}
      <div className="flex items-center gap-3">
        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as "madad" | "userScore" | "date")
          }
          className="px-3 py-2.5 min-h-[44px] rounded-lg border border-warm-gray bg-white text-xs sm:text-sm text-body focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: isHebrew
              ? "left 0.75rem center"
              : "right 0.75rem center",
            paddingInlineEnd: "2rem",
          }}
        >
          <option value="madad">{t("sort.madad")}</option>
          <option value="userScore">{t("sort.userScore")}</option>
          <option value="date">{t("sort.date")}</option>
        </select>

        {/* Madad dropdown */}
        <select
          value={activePreset >= 0 ? activePreset : 0}
          onChange={(e) =>
            onMadadRangeChange(MADAD_PRESETS[parseInt(e.target.value)].range)
          }
          className="px-3 py-2.5 min-h-[44px] rounded-lg border border-warm-gray bg-white text-xs sm:text-sm text-body focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: isHebrew
              ? "left 0.75rem center"
              : "right 0.75rem center",
            paddingInlineEnd: "2rem",
          }}
        >
          {MADAD_PRESETS.map((preset, idx) => (
            <option key={idx} value={idx}>
              {t("filter.madad")}: {isHebrew ? preset.labelHe : preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: Cuisine chips with scroll arrows + fade gradients */}
      <div className="relative">
        {/* Fade gradient — start side */}
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

        {/* Arrow button — start side (scroll back) */}
        {canScrollStart && (
          <button
            onClick={() => scroll("start")}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-warm-gray shadow-sm flex items-center justify-center hover:bg-warm-white transition-colors ${
              isHebrew ? "right-0" : "left-0"
            }`}
            aria-label="Scroll back"
          >
            <svg
              className="w-3.5 h-3.5 text-body"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d={isHebrew ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
        )}

        {/* Scrollable chips */}
        <div
          ref={scrollRef}
          className="chip-scroll"
          style={{
            paddingInlineStart: canScrollStart ? "2rem" : undefined,
            paddingInlineEnd: canScrollEnd ? "2rem" : undefined,
          }}
        >
          {/* "All" chip */}
          <button
            onClick={onClearTypes}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              selectedTypes.length === 0
                ? "bg-crimson text-white border-crimson"
                : "bg-white text-body border-warm-gray hover:border-crimson/40 hover:text-crimson"
            }`}
          >
            {t("filter.all")}
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => onTypeToggle(type)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                selectedTypes.includes(type)
                  ? "bg-crimson text-white border-crimson"
                  : "bg-white text-body border-warm-gray hover:border-crimson/40 hover:text-crimson"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Fade gradient — end side */}
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

        {/* Arrow button — end side (scroll forward) */}
        {canScrollEnd && (
          <button
            onClick={() => scroll("end")}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-warm-gray shadow-sm flex items-center justify-center hover:bg-warm-white transition-colors ${
              isHebrew ? "left-0" : "right-0"
            }`}
            aria-label="Scroll forward"
          >
            <svg
              className="w-3.5 h-3.5 text-body"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d={isHebrew ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
              />
            </svg>
          </button>
        )}
      </div>

      {/* Row 3: Active filter pills (conditional) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-crimson/10 text-crimson"
            >
              {type}
              <button
                onClick={() => onTypeToggle(type)}
                className="hover:text-crimson-dark transition-colors"
                aria-label={`Remove ${type}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
          {(madadRange[0] > 0 || madadRange[1] < 10) && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-crimson/10 text-crimson">
              {t("filter.madad")}:{" "}
              {isHebrew
                ? MADAD_PRESETS[activePreset]?.labelHe
                : MADAD_PRESETS[activePreset]?.label}
              <button
                onClick={() => onMadadRangeChange([0, 10])}
                className="hover:text-crimson-dark transition-colors"
                aria-label="Clear madad filter"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}
          <button
            onClick={handleClearAll}
            className="text-xs text-muted hover:text-crimson transition-colors underline"
          >
            {t("filter.clearAll")}
          </button>
        </div>
      )}
    </div>
  );
});
