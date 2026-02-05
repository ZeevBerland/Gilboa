import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      id: userId as string,
      name: (user.name as string | undefined) ?? "User",
      email: (user.email as string | undefined) ?? "",
    };
  },
});
