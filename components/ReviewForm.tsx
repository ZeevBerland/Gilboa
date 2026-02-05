"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/lib/language";
import { Id } from "@/convex/_generated/dataModel";

interface ReviewFormProps {
  restaurantId: Id<"restaurants">;
  userId?: string;
  userName?: string;
}

export function ReviewForm({ restaurantId, userId, userName }: ReviewFormProps) {
  const { t } = useLanguage();
  const createReview = useMutation(api.reviews.create);

  // Check if user already reviewed this restaurant
  const reviews = useQuery(api.reviews.getByRestaurant, { restaurantId });
  const existingReview = reviews?.find((r) => r.userId === userId);

  const [text, setText] = useState("");
  const [score, setScore] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!userId) {
    return (
      <div className="rounded-xl border border-warm-gray bg-warm-white p-4 sm:p-6 text-center">
        <p className="text-muted text-sm">{t("review.loginRequired")}</p>
      </div>
    );
  }

  // If user already has a review, don't show the form (they can edit from ReviewList)
  if (existingReview) {
    return null;
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-6 text-center">
        <p className="text-green-700 text-sm font-medium">
          {t("review.submit")} ✓
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await createReview({
        restaurantId,
        userId,
        userName: userName ?? "Anonymous",
        score,
        text: text.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-warm-gray bg-warm-white p-4 sm:p-6 space-y-4"
    >
      <h3 className="font-heading font-bold text-ink">
        {t("review.write")}
      </h3>

      {/* Review text */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("review.placeholder")}
        rows={3}
        className="w-full rounded-lg border border-warm-gray px-4 py-3 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40 resize-none"
        dir="auto"
        required
      />

      {/* Score slider -- only shows if text is entered */}
      {text.trim().length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span className="text-body font-medium">
              {t("review.scoreLabel")}
            </span>
            <span className="text-crimson font-bold text-lg">{score}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-crimson">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="w-full py-2.5 rounded-lg bg-crimson text-white font-medium text-sm hover:bg-crimson-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "..." : t("review.submit")}
      </button>
    </form>
  );
}
