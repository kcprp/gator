import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export async function fetchFeed(feedUrl: string) {
  const response = await fetch(feedUrl, {
    method: "GET",
    headers: {
      "User-Agent": "gator"
    }
  });
  const feed = await response.text();

  // Parse using fast-xml-parser
  const parser = new XMLParser();
  const jObj = parser.parse(feed);
  const channel = jObj.rss?.channel ?? jObj.channel;

  if (!channel) {
    throw new Error("channel field missing in the parsed XML object");
  }


  const { title, link, description } = channel;
  if (!title || !link || !description) {
    throw new Error("One or more required fields (title, link, description) are missing in channel.");
  }
  
  const items: Partial<RSSItem>[] = Array.isArray(channel.item)
    ? channel.item
    : [];

  const rssItems: RSSItem[] = [];
  items.forEach((item) => {
    const { title, link, description, pubDate } = item;
    if (!title || !link || !description || !pubDate) return;
    
    const rssItem: RSSItem = { title, link, description, pubDate };
    rssItems.push(rssItem);
  })

  const rssFeed: RSSFeed = {
    channel: {
      title,
      link,
      description,
      item: rssItems
    }
  } 

  return rssFeed;
} 