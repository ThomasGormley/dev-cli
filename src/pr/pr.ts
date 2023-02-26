import {
  boolean,
  command,
  flag,
  option,
  optional,
  string,
  subcommands,
} from "cmd-ts";
import { readFileSync } from "fs";
import prompts from "prompts";
import { execTty } from "../lib/exec";
import {
  BRANCH_WITH_JIRA_TICKET,
  findPullRequestTemplate,
  getCurrentBranch,
  isPwdGitRepo,
  PULL_REQUEST_TEMPLATE_MD,
} from "../lib/git";

const pwdInSocialchorus = process.cwd().includes("/socialchorus/");

const createCommand = command({
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
    useTemplate: flag({
      type: {
        ...boolean,
        defaultValue: () => {
          // use template by default in sc directory
          return pwdInSocialchorus;
        },
      },
      long: "use-template",
      short: "p",
    }),
  },
  name: "create",
  handler: async ({ title, body, useTemplate }) => {
    if (!isPwdGitRepo()) {
      process.exit(1);
    }

    if (!title) {
      title = await promptPrTitle();
    }

    if (!body) {
      body = await handleBody({ useTemplate: useTemplate });
    }
    console.log(body);
    execTty(`gh pr create --title ${title} --body '${body}'`);
  },
});

export const pr = subcommands({
  name: "pr",
  cmds: {
    create: createCommand,
  },
});

async function handleBody({ useTemplate }: { useTemplate: boolean }) {
  if (useTemplate && pwdInSocialchorus) {
    return await promptScChanges();
  }

  if (useTemplate) {
    return await promptOpenEditor();
  }

  const repoHasTemplate = Boolean(findPullRequestTemplate());

  if (repoHasTemplate) {
    return await promptPrTemplate();
  }
}

const firstupJiraLinkRegex =
  /https:\/\/firstup-io.atlassian.net\/browse\/[A-Z]+-/;
async function promptScChanges() {
  const repoTemplatePath = findPullRequestTemplate();
  const ticketString = getTicketFromBranch();
  const template = readFileSync(repoTemplatePath).toString();
  const templateWithTicket = template.replace(
    firstupJiraLinkRegex,
    `https://firstup-io.atlassian.net/browse/${ticketString}`,
  );

  return templateWithTicket;
}

function getTicketFromBranch() {
  const branchName = getCurrentBranch();
  const ticket = BRANCH_WITH_JIRA_TICKET.exec(branchName)?.[0];

  return ticket;
}

async function promptPrTitle() {
  const ticket = getTicketFromBranch();

  const response = await prompts({
    name: "title",
    type: "text",
    message: "Title",
    initial: ticket ? `[${ticket}] ` : undefined,
  });

  return response.title as string;
}

async function promptPrTemplate() {
  const response = await prompts({
    name: "template",
    type: "select",
    message: "Choose a template",
    choices: [
      { title: PULL_REQUEST_TEMPLATE_MD, value: "template" },
      { title: "Open a blank pull request", value: "blank" },
    ],
  });

  return response.template;
}

async function promptOpenEditor() {
  throw new Error("Function not implemented.");
}
