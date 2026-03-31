import { getPostsForUser } from "src/db/queries/posts";
import type { User } from "src/db/schema";

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]) {
  let limit = 2;

  if (args.length > 1) {
    throw new Error(`usage: ${cmdName} [limit:number]`);
  }

  if (args.length === 1) {
    const arg = args[0];
    const parsedLimit = Number(arg);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0 && Number.isInteger(parsedLimit)) {
      limit = parsedLimit;
    } else {
      throw new Error(`usage: ${cmdName} [limit:number]`);
    }
  }

  const latestPosts = await getPostsForUser(user.id, limit);
  
  if (latestPosts.length === 0) {
    console.log(`No posts found for ${user.name}.`);
    return;
  }

  console.log(`Latest posts for ${user.name}:`);
  latestPosts.forEach((post) => {
    console.log(`* ${post.title} (${post.feedName})`);
    console.log(`  ${post.url}`);
    console.log(`  ${post.description}`);
  });
}