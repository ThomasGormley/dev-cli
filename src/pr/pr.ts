import { subcommands } from "cmd-ts";
import { createCommand } from "./create/create";

export const pr = subcommands({
  name: "pr",
  cmds: {
    create: createCommand,
  },
});
