import { command, option, optional, string } from "cmd-ts";
import prompts from "prompts";
import { execTty } from "../../lib/exec";
import {
  FIRSTUP_JIRA_LINK_REGEX,
  getFirstupJiraUrl,
  isWorkstationRepo,
} from "../../lib/firstup";
import {
  BRANCH_WITH_JIRA_TICKET,
  findPullRequestTemplate,
  getCurrentBranch,
  getPullRequestTemplateString,
  isPwdGitRepo,
  PULL_REQUEST_TEMPLATE_MD,
} from "../../lib/git";
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