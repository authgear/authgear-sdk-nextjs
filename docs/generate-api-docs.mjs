import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";

if (existsSync("content/api")) {
  rmSync("content/api", { recursive: true });
}
execSync("npx typedoc --options typedoc.json", { stdio: "inherit" });
