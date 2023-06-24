import { execa, ExecaError } from "execa";
import { exec } from "../../../lib/exec";
import {
  FIRSTUP_JIRA_LINK_REGEX,
  getFirstupJiraUrl,
  isWorkstationRepo,
} from "../../../lib/firstup";
import {
  findPullRequestTemplate,
  getPullRequestTemplateString,
  getTicketFromBranch,
  isAuthenticated,
  isDirGitRepo,
} from "../../../lib/git";
import { defaultPrTemplate } from "./constants";
import { promptTemplateOrBlank, promptTitle } from "./prompts";
import { CreateArgs } from "./types";

export async function createHandler({ title, body, draft, rest }: CreateArgs) {
  // process.exit(1);
  if (!(await isDirGitRepo())) {
    console.error("Current directory is not a git repository");
    process.exit(1);
  }

  if (!isAuthenticated()) {
    console.error("Not authenticated");
    console.log(
      "Please authenticate using the GitHub CLI using `gh auth login`",
    );
    process.exit(1);
  }

  if (!title) {
    title = await handleTitle();
  }

  if (!body) {
    body = await handleBody();
  }

  const args = [
    "pr",
    "create",
    title ? `--title=${title}` : "",
    body || body === "" ? `--body=${body}` : "",
    draft ? "--draft" : "",
    rest || [],
  ].filter(Boolean);

  await exec("gh", args);
}

async function handleTitle() {
  return promptTitle();
}

async function handleBody() {
  const hasTemplate = Boolean(findPullRequestTemplate());

  if (hasTemplate) {
    return handleHasTemplate();
  }

  return "";
}

async function handleHasTemplate() {
  if (isWorkstationRepo) {
    return handleFirstupTemplate();
  }

  const template = await promptTemplateOrBlank();

  switch (template) {
    case "blank":
      return "";
    case "template":
      return getPullRequestTemplateString();
  }
}

async function handleFirstupTemplate() {
  const { ticket: ticketString } = getTicketFromBranch();
  const template = getPullRequestTemplateString() || defaultPrTemplate;
  console.log({ template });
  if (FIRSTUP_JIRA_LINK_REGEX.test(template) && ticketString) {
    const templateWithTicket = template.replace(
      FIRSTUP_JIRA_LINK_REGEX,
      getFirstupJiraUrl(ticketString).toString(),
    );
    return templateWithTicket;
  }

  return template;
}
