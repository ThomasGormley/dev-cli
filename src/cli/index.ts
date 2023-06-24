import { binary, subcommands } from "cmd-ts";
import { getPackageVersion } from "../lib/package";
import { pr } from "./pr/pr";
import { run } from "./run/run";

const version = getPackageVersion();
const cliCommands = subcommands({
  cmds: {
    pr: pr,
    run: run,
  },
  name: "dev",
  description: "Personal development CLI with utilities",
  version: version,
});

export const cli = binary(cliCommands);
