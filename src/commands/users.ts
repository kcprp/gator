import { setUser } from "../config";
import { createUser, getUser } from "src/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error('login handler expects a username');
  }

  const userName = args[0];
  const user = await getUser(userName);
  if (!user) {
    throw new Error(`Can't login ${userName}. The account does not exist!`)
  }
  setUser(user.name);
  console.log(`User set to ${userName}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error('register handler expects a name');
  }

  const userName = args[0];

  const existingUser = await getUser(userName);
  if (existingUser) {
    throw new Error(`User ${userName} already exists.`);
  }

  const user = await createUser(userName);
  if (!user) {
    throw new Error("Failed to create user");
  }
  setUser(user.name);
  console.log(`User ${user.name} created`);
}