import { command, option, optional, string } from "cmd-ts";
import { createHandler } from "./handler";

export const createCommand = command({
  args: {
    title: option({
      type: optional(string),
      long: "title",
      short: "t",
      description: "Pull request title string",
    }),
    body: option({
      type: optional(string),
      long: "body",
      short: "b",
      description: "Pull request changes",
    }),
  },
  name: "create",
  handler: createHandler,
});
