import { db } from "..";
import { feeds, users, feedFollows } from "../schema";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId }).returning();
  return result;
}

export async function getFeeds() {
  const results = await db
    .select({
      ...getTableColumns(feeds),
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
  return results;
}

export async function getFeed(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export async function markFeedFetched(feedId: string) {
  await db.update(feeds)
    .set({ updatedAt: sql`NOW()`, lastFetchedAt: sql`NOW()` })
    .where(eq(feeds.id, feedId))
}

export async function getNextFeedToFetch(userId: string) {
  const [nextFeed] = await db
    .select()
    .from(feeds)
    .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return nextFeed?.feeds;
}

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFeedFollow] = await db.insert(feedFollows).values({ userId, feedId }).returning();

  const [result] = await db
    .select({
      ...getTableColumns(feedFollows),
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return result;
}

export async function deleteFeedFollow(userId: string, feedId: string) {
  await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
}

export async function getFeedFollowsForUser(userId: string) {
  const results = await db
    .select({
      ...getTableColumns(feedFollows),
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));

  return results;
}