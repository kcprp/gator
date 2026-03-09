import { deleteUsers } from "src/db/queries/users";

export async function handlerReset(_: string) {
  await deleteUsers();
  console.log("All users have been successfully deleted.");
}