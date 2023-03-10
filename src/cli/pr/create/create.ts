import { boolean, command, flag, option, optional, rest, string } from "cmd-ts";
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
  rest: rest({
    displayName: "GitHub PR Create Args",
    description:
      "Escape hatch to allow sending all valid arguments for `gh pr create`",
  }),
};

export const createCommand = command({
  args: createArgs,
  name: "create",
  handler: createHandler,
});
