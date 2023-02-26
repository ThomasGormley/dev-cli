import { command, option, optional, string } from "cmd-ts";
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
  handler: async ({ title, body }) => {
    if (!isPwdGitRepo()) {
      process.exit(1);
    }

    if (!title) {
      title = await promptPrTitle();
    }

    if (!body) {
      body = await handleBody();
    }

    execTty(`gh pr create --title ${title} --body '${body}'`);
  },
});

async function handleBody() {
  if (pwdInSocialchorus) {
    return await promptScChanges();
  }

  const hasTemplate = Boolean(findPullRequestTemplate());
  if (hasTemplate) {
    return await promptPrTemplate();
  }

  return "";
}

async function promptScChanges() {
  const firstupJiraLinkRegex =
    /https:\/\/firstup-io.atlassian.net\/browse\/[A-Z]+-/;
  const repoTemplatePath = findPullRequestTemplate();
  const ticketString = getTicketFromBranch();
  const template = readFileSync(repoTemplatePath).toString();

  if (firstupJiraLinkRegex.test(template)) {
    const templateWithTicket = template.replace(
      firstupJiraLinkRegex,
      `https://firstup-io.atlassian.net/browse/${ticketString}`,
    );
    return templateWithTicket;
  }

  return template;
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

  const repoTemplatePath = findPullRequestTemplate();
  return response.template === "template"
    ? readFileSync(repoTemplatePath).toString()
    : "";
}

async function promptOpenEditor() {
  console.log("promptOpenEditor");
  await prompts({
    name: "body",
    type: "text",
    message: "Open in VSCode",
    onState: (prev, values) => console.log({ prev, values }),
  });
}
