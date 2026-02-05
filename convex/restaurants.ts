import { query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// Strip heavy fields (embedding, descriptions) for card listings
function toCardData(r: Doc<"restaurants">) {
  const { embedding, description, descriptionHe, ...rest } = r;
  return rest;
}

// ---- Queries ----

export const list = query({
  args: {
    type: v.optional(v.string()),
    sortBy: v.optional(
      v.union(v.literal("madad"), v.literal("userScore"), v.literal("date"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy ?? "madad";

    // When filtering by type, we must sort in memory (type index doesn't include sort fields)
    if (args.type) {
      const restaurants = await ctx.db
        .query("restaurants")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();

      if (sortBy === "madad") {
        restaurants.sort((a, b) => b.madadNumber - a.madadNumber);
      } else if (sortBy === "userScore") {
        restaurants.sort((a, b) => (b.userScore ?? 0) - (a.userScore ?? 0));
      } else if (sortBy === "date") {
        restaurants.sort((a, b) => b.date.localeCompare(a.date));
      }

      const result = args.limit ? restaurants.slice(0, args.limit) : restaurants;
      return result.map(toCardData);
    }

    // No type filter: use sorting indexes for efficient ordering
    let q;
    if (sortBy === "date") {
      q = ctx.db.query("restaurants").withIndex("by_date").order("desc");
    } else if (sortBy === "userScore") {
      q = ctx.db.query("restaurants").withIndex("by_userScore").order("desc");
    } else {
      // Default: by madad
      q = ctx.db.query("restaurants").withIndex("by_madad").order("desc");
    }

    const restaurants = args.limit ? await q.take(args.limit) : await q.collect();
    return restaurants.map(toCardData);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return restaurant;
  },
});

export const searchByName = query({
  args: {
    query: v.string(),
    lang: v.optional(v.union(v.literal("he"), v.literal("en"))),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    const lang = args.lang ?? "he";
    const q = args.query;

    // Search across multiple indexes in parallel, then merge & deduplicate
    const [byName, byNameHe, byAddress, byType, byTypeHe, byDesc, byDescHe] =
      await Promise.all([
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_name", (s) => s.search("name", q))
          .take(15),
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_nameHe", (s) => s.search("nameHe", q))
          .take(15),
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_address", (s) => s.search("address", q))
          .take(15),
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_type", (s) => s.search("type", q))
          .take(15),
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_typeHe", (s) => s.search("typeHe", q))
          .take(15),
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_description", (s) =>
            s.search("description", q)
          )
          .take(10),
        ctx.db
          .query("restaurants")
          .withSearchIndex("search_descriptionHe", (s) =>
            s.search("descriptionHe", q)
          )
          .take(10),
      ]);

    // Prioritize: name matches first, then type, then address, then description
    const nameResults = lang === "he" ? byNameHe : byName;
    const typeResults = lang === "he" ? byTypeHe : byType;
    const descResults = lang === "he" ? byDescHe : byDesc;

    const seen = new Set<string>();
    const merged = [];

    for (const batch of [nameResults, typeResults, byAddress, descResults]) {
      for (const r of batch) {
        const id = r._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          merged.push(r);
        }
      }
    }

    // Also add results from the other language as fallback
    const nameOther = lang === "he" ? byName : byNameHe;
    const typeOther = lang === "he" ? byType : byTypeHe;
    const descOther = lang === "he" ? byDesc : byDescHe;

    for (const batch of [nameOther, typeOther, descOther]) {
      for (const r of batch) {
        const id = r._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          merged.push(r);
        }
      }
    }

    return merged.slice(0, 30).map(toCardData);
  },
});

export const getTypes = query({
  handler: async (ctx) => {
    const restaurants = await ctx.db.query("restaurants").collect();
    const types = new Set<string>();
    const typesHe = new Set<string>();
    for (const r of restaurants) {
      if (r.type) types.add(r.type);
      if (r.typeHe) typesHe.add(r.typeHe);
    }
    return {
      en: Array.from(types).sort(),
      he: Array.from(typesHe).sort(),
    };
  },
});

export const featured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    // Use the by_madad index to avoid full table scan + sort
    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_madad")
      .order("desc")
      .take(limit);
    return restaurants.map(toCardData);
  },
});

// ---- Mutations (internal, for seeding) ----

export const insertRestaurant = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if already exists by slug
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("restaurants", {
      ...args,
      userScore: undefined,
      userReviewCount: undefined,
      embedding: undefined,
    });
  },
});

export const updateEmbedding = internalMutation({
  args: {
    id: v.id("restaurants"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { embedding: args.embedding });
  },
});

export const updateUserScore = internalMutation({
  args: {
    restaurantId: v.id("restaurants"),
    userScore: v.number(),
    userReviewCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.restaurantId, {
      userScore: args.userScore,
      userReviewCount: args.userReviewCount,
    });
  },
});
