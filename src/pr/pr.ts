import { subcommands } from "cmd-ts";
import { createCommand } from "./create";

export const pr = subcommands({
  name: "pr",
  cmds: {
    create: createCommand,
  },
});
