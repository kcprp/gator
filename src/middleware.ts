import type { CommandHandler, UserCommandHandler } from "src/commands/commands";
import { getUser } from "src/db/queries/users";
import { readConfig } from "src/config";

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }

    return handler(cmdName, user, ...args);
  };
}