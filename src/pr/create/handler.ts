import { execTty } from "../../lib/exec";
import {
  FIRSTUP_JIRA_LINK_REGEX,
  getFirstupJiraUrl,
  isWorkstationRepo,
} from "../../lib/firstup";
import {
  findPullRequestTemplate,
  getPullRequestTemplateString,
  getTicketFromBranch,
  isPwdGitRepo,
} from "../../lib/git";
import { promptTemplateOrBlank, promptTitle } from "./prompts";
import { CreateArgs } from "./types";

export async function createHandler({ title, body, draft }: CreateArgs) {
  if (!isPwdGitRepo()) {
    process.exit(1);
  }

  if (!title) {
    title = await handleTitle();
  }

  if (!body) {
    body = await handleBody();
  }

  execTty(
    [
      "gh pr create",
      `--title "${title}"`,
      `--body "${body}"`,
      draft && "--draft",
    ]
      .filter(Boolean)
      .join(" "),
  );
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
  const template = getPullRequestTemplateString();

  if (FIRSTUP_JIRA_LINK_REGEX.test(template) && ticketString) {
    const templateWithTicket = template.replace(
      FIRSTUP_JIRA_LINK_REGEX,
      getFirstupJiraUrl(ticketString).toString(),
    );
    return templateWithTicket;
  }

  return template;
}
