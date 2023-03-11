#!/usr/bin/env node
import { run, subcommands, binary } from "cmd-ts";
import { pr } from "./cli/pr/pr";

const cliCommands = subcommands({
  cmds: {
    pr: pr,
  },
  name: "dev",
  description: "Personal development CLI with utilities",
  version: "0.0.1",
});

const cli = binary(cliCommands);

async function main() {
  const val = await run(cli, process.argv);
  val.command;
}

main();
