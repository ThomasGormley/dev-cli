import { command, option, optional, string } from "cmd-ts";
import { createHandler } from "./handler";

export const createArgs = {
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
  draft: option({
    type: optional(string),
    long: "draft",
    short: "d",
    description: "Mark pull request as a draft",
  }),
};

export const createCommand = command({
  args: createArgs,
  name: "create",
  handler: createHandler,
});
