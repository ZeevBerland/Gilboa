import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Returns the set of restaurant IDs the current user has favorited (lightweight)
export const getUserFavoriteIds = query({
  handler: async (ctx): Promise<string[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId as string))
      .collect();

    return favs.map((f) => f.restaurantId as string);
  },
});

export const getUserFavorites = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId as string))
      .collect();

    // Sort newest first
    favs.sort((a, b) => b.createdAt - a.createdAt);

    // Fetch the restaurant data for each favorite
    const restaurants = await Promise.all(
      favs.map(async (fav) => {
        const restaurant = await ctx.db.get(fav.restaurantId);
        return restaurant;
      })
    );

    return restaurants.filter(
      (r): r is NonNullable<typeof r> => r !== null
    );
  },
});

export const toggle = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", userId as string).eq("restaurantId", args.restaurantId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // removed
    } else {
      await ctx.db.insert("favorites", {
        userId: userId as string,
        restaurantId: args.restaurantId,
        createdAt: Date.now(),
      });
      return true; // added
    }
  },
});
