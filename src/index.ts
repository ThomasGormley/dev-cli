#!/usr/bin/env node
import { run } from "cmd-ts";
import { cli } from "./cli";

async function main() {
  await run(cli, process.argv);
}

main();
