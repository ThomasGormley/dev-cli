import { execOut } from "../../lib/exec";

export function getCurrentBranch() {
  return execOut("git branch --show-current");
}
