import { binary, subcommands } from "cmd-ts";
import { getPackageVersion } from "../lib/internal";
import { pr } from "./pr/pr";
import { run } from "./run/run";

const version = getPackageVersion();
const cliCommands = subcommands({
  cmds: {
    pr: pr,
    run: run,
  },
  name: "dev",
  description: "Development toolbox CLI with common utilities and script",
  version: version,
});

export const cli = binary(cliCommands);
