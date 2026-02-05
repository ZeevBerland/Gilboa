import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    // Use composite index for pre-sorted results (newest first)
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_restaurant_createdAt", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .take(50);

    return reviews;
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    userId: v.string(),
    userName: v.string(),
    score: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate score range
    if (args.score < 1 || args.score > 10) {
      throw new Error("Score must be between 1 and 10");
    }

    // Validate text is not empty (score requires a written review)
    if (!args.text.trim()) {
      throw new Error("A written review is required to submit a score");
    }

    // Check if user already reviewed this restaurant
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", args.userId).eq("restaurantId", args.restaurantId)
      )
      .first();

    if (existing) {
      throw new Error("You have already reviewed this restaurant");
    }

    // Insert the review
    await ctx.db.insert("reviews", {
      restaurantId: args.restaurantId,
      userId: args.userId,
      userName: args.userName,
      score: args.score,
      text: args.text,
      createdAt: Date.now(),
    });

    // Recalculate the restaurant's user score
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const totalScore = allReviews.reduce((sum, r) => sum + r.score, 0);
    const avgScore =
      allReviews.length > 0
        ? Math.round((totalScore / allReviews.length) * 10) / 10
        : 0;

    await ctx.scheduler.runAfter(0, internal.restaurants.updateUserScore, {
      restaurantId: args.restaurantId,
      userScore: avgScore,
      userReviewCount: allReviews.length,
    });
  },
});

// Helper to recalculate user score for a restaurant
async function recalculateUserScore(
  ctx: { db: any; scheduler: any },
  restaurantId: any
) {
  const allReviews = await ctx.db
    .query("reviews")
    .withIndex("by_restaurant", (q: any) =>
      q.eq("restaurantId", restaurantId)
    )
    .collect();

  const totalScore = allReviews.reduce(
    (sum: number, r: any) => sum + r.score,
    0
  );
  const avgScore =
    allReviews.length > 0
      ? Math.round((totalScore / allReviews.length) * 10) / 10
      : 0;

  await ctx.scheduler.runAfter(0, internal.restaurants.updateUserScore, {
    restaurantId,
    userScore: avgScore,
    userReviewCount: allReviews.length,
  });
}

export const update = mutation({
  args: {
    reviewId: v.id("reviews"),
    score: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.userId !== (userId as string))
      throw new Error("Not authorized to edit this review");

    if (args.score < 1 || args.score > 10)
      throw new Error("Score must be between 1 and 10");
    if (!args.text.trim())
      throw new Error("A written review is required");

    await ctx.db.patch(args.reviewId, {
      score: args.score,
      text: args.text.trim(),
    });

    await recalculateUserScore(ctx, review.restaurantId);
  },
});

export const remove = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.userId !== (userId as string))
      throw new Error("Not authorized to delete this review");

    const restaurantId = review.restaurantId;
    await ctx.db.delete(args.reviewId);

    await recalculateUserScore(ctx, restaurantId);
  },
});
