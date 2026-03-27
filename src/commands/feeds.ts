import { fetchFeed } from "src/utils/rss";
import { createFeed, getFeeds, getFeed, createFeedFollow, deleteFeedFollow, getFeedFollowsForUser } from "src/db/queries/feeds";
import type { Feed, User } from "src/db/schema";

const DEFAULT_FEED_URL = "https://www.wagslane.dev/index.xml";

export async function handlerAgg(_: string, ...args: string[]) {
  const feedUrl = args[0] ?? DEFAULT_FEED_URL;
  const feed = await fetchFeed(feedUrl);
  console.log(JSON.stringify(feed, null, 2));
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <feed_name> <url>`);
  }
  
  const feedName = args[0];
  const url = args[1];

  const feed = await createFeed(feedName, url, user.id);
  if (!feed) {
    throw new Error(`Failed to create feed`);
  }

  await createFeedFollow(user.id, feed.id)

  console.log("Feed created successfully:");
  printFeed(feed, user);
};

export async function handlerFeeds(_: string, ...args: string[]) {
  const feeds = await getFeeds();

  if (!feeds) {
    throw new Error("Could not got feeds");
  }

  feeds.forEach(feed => {
    console.log(`Name: ${feed.name}, URL: ${feed.url}, User: ${feed.userName}`);
  });
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const url = args[0];
  const feed = await getFeed(url);

  if (!feed) {
    throw new Error(`Could not find feed corresponding to ${url}`);
  }
  
  const feedFollow = await createFeedFollow(user.id, feed.id)
  console.log(`* Feed name:     ${feedFollow.feedName}`);
  console.log(`* User name:     ${feedFollow.userName}`);
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }
  
  const url = args[0];
  const feed = await getFeed(url);

  if (!feed) {
    throw new Error(`Could not find feed corresponding to ${url}`);
  }

  await deleteFeedFollow(user.id, feed.id);
  console.log(`Deleted feed: ${feed.name} for user: ${user.name}`);
}

export async function handlerFollowing(_: string, user: User) {
  const feedFollows = await getFeedFollowsForUser(user.id);

  if (feedFollows.length === 0) {
    console.log(`${user.name} is not following any feeds.`);
    return;
  }

  console.log(`${user.name} is following:`);
  feedFollows.forEach((feedFollow) => {
    console.log(`* ${feedFollow.feedName}`);
  });
}

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}