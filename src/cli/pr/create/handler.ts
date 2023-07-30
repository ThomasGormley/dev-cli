import { exec } from "../../../lib/exec";
import {
  FIRSTUP_JIRA_LINK_REGEX,
  getFirstupJiraUrl,
  isWorkstationRepo,
} from "../../../lib/firstup";
import {
  findPullRequestTemplate,
  getGitChangeMessages,
  getPullRequestTemplateString,
  getTicketFromBranch,
  isAuthenticated,
  isDirGitRepo,
} from "../../../lib/git";
import { applyTransformationsToString } from "../../../lib/string";
import { defaultPrTemplate } from "./constants";
import { promptTitle } from "./prompts";
import { CreateArgs } from "./types";

export async function createHandler({ title, body, draft, rest }: CreateArgs) {
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
    body && `--body=${body}`,
    draft ? "--draft" : "",
    rest.length > 0 ? rest : "",
  ].filter(Boolean);

  await exec("gh", args);
}

async function handleTitle() {
  return promptTitle();
}

async function handleBody() {
  const hasTemplate = Boolean(findPullRequestTemplate());
  if (hasTemplate && isWorkstationRepo) {
    return handleFirstupTemplate();
  }

  return undefined;
}

async function handleFirstupTemplate() {
  const template = getPullRequestTemplateString() || defaultPrTemplate;

  const transformedTemplate = applyTransformationsToString(template, [
    (body) => {
      const { ticket: ticketString } = getTicketFromBranch();
      const bodyHasJiraLink = FIRSTUP_JIRA_LINK_REGEX.test(body);
      return bodyHasJiraLink && ticketString
        ? body.replace(
            FIRSTUP_JIRA_LINK_REGEX,
            getFirstupJiraUrl(ticketString).toString(),
          )
        : body;
    },
    (body) => {
      const changesHeader = "**Changes**";
      const hasChangesHeader = body.includes(changesHeader);
      // append markdown bulletpoint before each change message on a new line
      const changesList = `\n${getGitChangeMessages()
        .map((change) => `- ${change}`)
        .join("\n")}`;

      return hasChangesHeader
        ? body.replace(changesHeader, changesHeader + changesList)
        : body;
    },
  ]);

  return transformedTemplate;
}
