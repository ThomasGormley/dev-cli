#!/usr/bin/env node
import { run } from "cmd-ts";
import { cli } from "./cli";
import { initConfigDirectory } from "./lib/config";

async function main() {
  await initConfigDirectory();
  await run(cli, process.argv);
}

main();
