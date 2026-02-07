"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/language";

type SearchMode = "keyword" | "natural";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onNaturalSearch?: (query: string) => void;
  showModeToggle?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  onNaturalSearch,
  showModeToggle = false,
  className = "",
}: SearchBarProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<SearchMode>("keyword");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      if (mode === "keyword") {
        // Debounce search to avoid firing on every keystroke
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onSearch(v);
        }, 300);
      }
    },
    [onSearch, mode]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Cancel any pending debounce and fire immediately on submit
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (mode === "natural" && onNaturalSearch) {
        onNaturalSearch(value);
      } else {
        onSearch(value);
      }
    },
    [value, mode, onSearch, onNaturalSearch]
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValue("");
    onSearch("");
  }, [onSearch]);

  const placeholder =
    mode === "natural" ? t("search.nlPlaceholder") : t("search.placeholder");

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full sm:max-w-xl ${className}`}
    >
      {/* Mode toggle */}
      {showModeToggle && onNaturalSearch && (
        <div className="flex gap-1 mb-2 justify-center">
          <button
            type="button"
            onClick={() => setMode("keyword")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              mode === "keyword"
                ? "bg-crimson text-white"
                : "bg-warm-white text-body border border-warm-gray hover:bg-warm-gray"
            }`}
          >
            {t("nav.browse")}
          </button>
          <button
            type="button"
            onClick={() => setMode("natural")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              mode === "natural"
                ? "bg-crimson text-white"
                : "bg-warm-white text-body border border-warm-gray hover:bg-warm-gray"
            }`}
          >
            AI
          </button>
        </div>
      )}

      {/* Search icon */}
      <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
        <svg
          className="w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full ps-11 pe-10 py-3 rounded-full border border-warm-gray bg-white text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40 transition-all text-base sm:text-sm"
        dir="auto"
      />

      {/* Clear / Submit button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted hover:text-body transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
