import { execSync } from "child_process";

export function exec(command: string) {
  return execSync(command, { stdio: "ignore" });
}

export function execOut(command: string) {
  return execSync(command).toString().trim();
}

export function execTty(command: string) {
  return execSync(command, { stdio: "inherit" });
}
