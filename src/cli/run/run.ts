import { subcommands } from "cmd-ts";
import { tscCommand } from "./tsc";

export const run = subcommands({
  name: "run",
  cmds: {
    tsc: tscCommand,
  },
});
