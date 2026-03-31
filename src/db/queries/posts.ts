import { desc, eq, getTableColumns } from "drizzle-orm";

import { feedFollows, feeds, posts } from "../schema";
import { db } from "..";
import type { NewPost } from "../schema";

export async function createPost(post: NewPost) {
  const [result] = await db
    .insert(posts)
    .values(post)
    .onConflictDoNothing({ target: posts.url })
    .returning();
  return result;
}

export async function getPostsForUser(userId: string, limit?: number) {
  const query = db
    .select({
      ...getTableColumns(posts),
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt));

  return limit !== undefined ? await query.limit(limit) : await query;
}