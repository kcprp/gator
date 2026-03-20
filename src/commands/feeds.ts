import { fetchFeed } from "src/utils/rss";
import { createFeed, getFeeds } from "src/db/queries/feeds";
import { readConfig } from "src/config";
import { getUser } from "src/db/queries/users";
import type { Feed, User } from "src/db/schema";

const DEFAULT_FEED_URL = "https://www.wagslane.dev/index.xml";

export async function handlerAgg(_: string, ...args: string[]) {
  const feedUrl = args[0] ?? DEFAULT_FEED_URL;
  const feed = await fetchFeed(feedUrl);
  console.log(JSON.stringify(feed, null, 2));
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <feed_name> <url>`);
  }

  const config = readConfig();
  const user = await getUser(config.currentUserName);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`)
  }
  
  const feedName = args[0];
  const url = args[1];

  const feed = await createFeed(feedName, url, user.id);
  if (!feed) {
    throw new Error(`Failed to create feed`);
  }
  
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

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

