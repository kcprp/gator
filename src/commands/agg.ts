import { fetchFeed } from "src/utils/rss";

const DEFAULT_FEED_URL = "https://www.wagslane.dev/index.xml";

export async function handlerAgg(_: string, ...args: string[]) {
  const feedUrl = args[0] ?? DEFAULT_FEED_URL;
  const feed = await fetchFeed(feedUrl);
  console.log(JSON.stringify(feed, null, 2));
}