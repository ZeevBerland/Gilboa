import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Seed the restaurants table from a JSON array.
 *
 * Usage: Call this action from the Convex dashboard or a script,
 * passing the parsed CSV data as a JSON array.
 */
export const seedRestaurants = action({
  args: {
    restaurants: v.array(
      v.object({
        name: v.string(),
        nameHe: v.string(),
        address: v.string(),
        description: v.string(),
        descriptionHe: v.string(),
        type: v.string(),
        typeHe: v.string(),
        madadNumber: v.number(),
        date: v.string(),
        youtubeUrl: v.string(),
        videoId: v.string(),
        slug: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const restaurant of args.restaurants) {
      try {
        const id = await ctx.runMutation(
          internal.restaurants.insertRestaurant,
          restaurant
        );
        if (id) inserted++;
      } catch {
        skipped++;
      }
    }

    return { inserted, skipped, total: args.restaurants.length };
  },
});
