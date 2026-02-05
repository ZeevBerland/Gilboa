import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  restaurants: defineTable({
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
    // Denormalized user review stats
    userScore: v.optional(v.number()),
    userReviewCount: v.optional(v.number()),
    // Vector embedding for NL search
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_madad", ["madadNumber"])
    .index("by_date", ["date"])
    .index("by_userScore", ["userScore"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["type"],
    })
    .searchIndex("search_nameHe", {
      searchField: "nameHe",
      filterFields: ["typeHe"],
    })
    .searchIndex("search_address", {
      searchField: "address",
    })
    .searchIndex("search_type", {
      searchField: "type",
    })
    .searchIndex("search_typeHe", {
      searchField: "typeHe",
    })
    .searchIndex("search_description", {
      searchField: "description",
    })
    .searchIndex("search_descriptionHe", {
      searchField: "descriptionHe",
    })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["type"],
    }),

  reviews: defineTable({
    restaurantId: v.id("restaurants"),
    userId: v.string(),
    userName: v.string(),
    score: v.number(),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_createdAt", ["restaurantId", "createdAt"])
    .index("by_user_restaurant", ["userId", "restaurantId"]),

  favorites: defineTable({
    userId: v.string(),
    restaurantId: v.id("restaurants"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_restaurant", ["userId", "restaurantId"]),
});
