import { binary, subcommands } from "cmd-ts";
import { getPackageVersion } from "../lib/get-package-version";
import { pr } from "./pr/pr";

const version = getPackageVersion();
const cliCommands = subcommands({
  cmds: {
    pr: pr,
  },
  name: "dev",
  description: "Personal development CLI with utilities",
  version: version,
});

export const cli = binary(cliCommands);
