"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/lib/language";
import { Id } from "@/convex/_generated/dataModel";

interface ReviewListProps {
  restaurantId: Id<"restaurants">;
}

export function ReviewList({ restaurantId }: ReviewListProps) {
  const { t, isHebrew } = useLanguage();
  const reviews = useQuery(api.reviews.getByRestaurant, { restaurantId });
  const currentUser = useQuery(api.users.currentUser);

  if (reviews === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-warm-gray p-4 space-y-2"
          >
            <div className="h-3 bg-warm-gray rounded w-1/4" />
            <div className="h-3 bg-warm-gray rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-center text-muted py-8 text-sm">
        {t("restaurant.noReviews")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review._id}
          review={review}
          isOwn={currentUser?.id === review.userId}
        />
      ))}
    </div>
  );
}

/* ---- Single review item with edit/delete ---- */

function ReviewItem({
  review,
  isOwn,
}: {
  review: {
    _id: Id<"reviews">;
    userName: string;
    score: number;
    text: string;
    createdAt: number;
  };
  isOwn: boolean;
}) {
  const { t, isHebrew } = useLanguage();
  const updateReview = useMutation(api.reviews.update);
  const removeReview = useMutation(api.reviews.remove);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(review.text);
  const [editScore, setEditScore] = useState(review.score);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      await updateReview({
        reviewId: review._id,
        score: editScore,
        text: editText.trim(),
      });
      setEditing(false);
    } catch {
      // Error handling - stay in edit mode
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeReview({ reviewId: review._id });
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="rounded-lg border border-warm-gray/60 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-warm-gray flex items-center justify-center text-xs font-bold text-body">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-ink">
            {review.userName}
          </span>
        </div>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-crimson/10 text-sm font-bold text-crimson">
          {editing ? editScore : review.score}
        </span>
      </div>

      {/* Editing mode */}
      {editing ? (
        <div className="space-y-3 mt-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-warm-gray px-3 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40 resize-none"
            dir="auto"
          />
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs">
              <span className="text-body font-medium">
                {t("review.scoreLabel")}
              </span>
              <span className="text-crimson font-bold">{editScore}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={editScore}
              onChange={(e) => setEditScore(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !editText.trim()}
              className="px-3 py-1.5 rounded-lg bg-crimson text-white text-xs font-medium hover:bg-crimson-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "..." : t("review.save")}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditText(review.text);
                setEditScore(review.score);
              }}
              className="px-3 py-1.5 rounded-lg border border-warm-gray text-xs text-body hover:bg-warm-white transition-colors"
            >
              {t("review.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Review text */}
          <p className="text-sm text-body leading-relaxed" dir="auto">
            {review.text}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-muted">
              {new Date(review.createdAt).toLocaleDateString(
                isHebrew ? "he-IL" : "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              )}
            </p>

            {/* Edit/Delete buttons for own reviews */}
            {isOwn && !confirmDelete && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="text-[11px] text-muted hover:text-crimson transition-colors"
                >
                  {t("review.edit")}
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[11px] text-muted hover:text-crimson transition-colors"
                >
                  {t("review.delete")}
                </button>
              </div>
            )}

            {/* Delete confirmation */}
            {isOwn && confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-crimson">
                  {t("review.deleteConfirm")}
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-[11px] font-medium text-crimson hover:text-crimson-dark transition-colors"
                >
                  {deleting ? "..." : t("review.delete")}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[11px] text-muted hover:text-body transition-colors"
                >
                  {t("review.cancel")}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
