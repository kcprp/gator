import { setUser, readConfig } from "./config";

function main() {
  const currentUser = "Kacper";
  setUser(currentUser);
  const config = readConfig();
  console.log(config);
}

main();