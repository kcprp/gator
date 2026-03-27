import {
  type CommandsRegistry, 
  registerCommand,
  runCommand
} from './commands/commands'
import { handlerLogin, handlerRegister, handlerListUsers } from './commands/users';
import { handlerReset } from './commands/reset';
import { handlerAgg, handlerAddFeed, handlerFeeds, handlerFollow, handlerUnfollow, handlerFollowing } from './commands/feeds';
import { middlewareLoggedIn } from './middleware';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandsRegistry: CommandsRegistry = {};

  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegister);
  registerCommand(commandsRegistry, "reset", handlerReset);
  registerCommand(commandsRegistry, "users", handlerListUsers);
  registerCommand(commandsRegistry, "agg", handlerAgg);
  registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(commandsRegistry, "feeds", handlerFeeds);
  registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow));

  try {
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.log(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();