"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/lib/language";
import { Id } from "@/convex/_generated/dataModel";

interface FavoriteButtonProps {
  restaurantId: Id<"restaurants">;
  isFavorite: boolean;
  size?: "sm" | "md";
}

export function FavoriteButton({
  restaurantId,
  isFavorite: isFav,
  size = "md",
}: FavoriteButtonProps) {
  const { t } = useLanguage();
  const toggle = useMutation(api.favorites.toggle);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle({ restaurantId });
  };

  const isSm = size === "sm";

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full transition-all ${
        isSm ? "w-8 h-8" : "w-10 h-10"
      } ${
        isFav
          ? "bg-crimson/10 text-crimson hover:bg-crimson/20"
          : "bg-white/80 text-muted hover:text-crimson hover:bg-white"
      }`}
      aria-label={isFav ? t("favorites.remove") : t("favorites.add")}
      title={isFav ? t("favorites.remove") : t("favorites.add")}
    >
      <svg
        className={isSm ? "w-4 h-4" : "w-5 h-5"}
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
