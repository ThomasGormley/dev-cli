import { boolean, command, flag, option, optional, string } from "cmd-ts";
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
  draft: flag({
    type: boolean,
    long: "draft",
    short: "d",
  }),
};

export const createCommand = command({
  args: createArgs,
  name: "create",
  handler: createHandler,
});
