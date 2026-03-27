import { db } from "..";
import { feeds, users, feedFollows } from "../schema";
import { and, eq, getTableColumns } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId }).returning();
  return result;
}

export async function getFeeds() {
  const results = await db
    .select({
      id: feeds.id,
      createdAt: feeds.createdAt,
      updatedAt: feeds.updatedAt,
      name: feeds.name,
      url: feeds.url,
      userId: feeds.userId,
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