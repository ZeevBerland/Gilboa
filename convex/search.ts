import { action, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/**
 * Generate an embedding for a text using Gemini text-embedding-004.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.embedding.values as number[];
}

// ---- Internal queries (defined first to avoid circular references) ----

/**
 * Internal query to fetch a restaurant by ID (used by NL search action).
 */
export const getRestaurantById = internalQuery({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args): Promise<Doc<"restaurants"> | null> => {
    return await ctx.db.get(args.id);
  },
});

export const restaurantsWithoutEmbeddings = internalQuery({
  handler: async (ctx): Promise<Doc<"restaurants">[]> => {
    const all = await ctx.db.query("restaurants").collect();
    return all.filter((r) => !r.embedding || r.embedding.length === 0);
  },
});

// ---- Actions ----

/**
 * Natural language search: generates an embedding for the user's query
 * and finds semantically similar restaurants.
 */
export const naturalLanguageSearch = action({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<(Doc<"restaurants"> & { _score: number })[]> => {
    const embedding = await generateEmbedding(args.query);

    const results = await ctx.vectorSearch("restaurants", "by_embedding", {
      vector: embedding,
      limit: args.limit ?? 10,
    });

    // Fetch full restaurant documents
    const restaurants: (Doc<"restaurants"> & { _score: number })[] = [];
    for (const result of results) {
      const doc: Doc<"restaurants"> | null = await ctx.runQuery(
        internal.search.getRestaurantById,
        { id: result._id }
      );
      if (doc) {
        restaurants.push({ ...doc, _score: result._score });
      }
    }

    return restaurants;
  },
});

/**
 * Generate and store embeddings for all restaurants that don't have one.
 * Run this after seeding.
 */
export const generateAllEmbeddings = internalAction({
  handler: async (ctx): Promise<{ updated: number; total: number }> => {
    const restaurants: Doc<"restaurants">[] = await ctx.runQuery(
      internal.search.restaurantsWithoutEmbeddings
    );

    let count = 0;
    for (const r of restaurants) {
      const text = [r.name, r.nameHe, r.type, r.typeHe, r.address, r.description, r.descriptionHe]
        .filter(Boolean)
        .join(". ");

      try {
        const embedding = await generateEmbedding(text);
        await ctx.runMutation(internal.restaurants.updateEmbedding, {
          id: r._id,
          embedding,
        });
        count++;

        // Small delay to avoid rate limiting
        if (count % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`Failed to generate embedding for ${r.name}:`, err);
      }
    }

    return { updated: count, total: restaurants.length };
  },
});
