import { execaCommand, execaCommandSync } from "execa";
import { existsSync, readFileSync } from "fs";
import path from "path";

export const BRANCH_WITH_JIRA_TICKET = /[A-Z]+-[0-9]+/;
export const PULL_REQUEST_TEMPLATE_MD = "pull_request_template.md";

export async function isDirGitRepo(dir = process.cwd()) {
  try {
    const { stdout } = await execaCommand(
      "git rev-parse --is-inside-work-tree",
      {
        cwd: dir,
      },
    );
    return Boolean(stdout);
  } catch (error) {
    return false;
  }
}

export function getCurrentBranch() {
  const { stdout } = execaCommandSync("git branch --show-current");
  return stdout;
}

const GIT_PULL_REQUEST_TEMPLATE_LOCATIONS = [
  "./",
  "./.github/PULL_REQUEST_TEMPLATE/",
  "./.github/",
  "./docs/",
] as const;
export function findPullRequestTemplate() {
  const root = getGitRootDir();
  const paths = GIT_PULL_REQUEST_TEMPLATE_LOCATIONS.map((dir) =>
    path.join(root, dir, PULL_REQUEST_TEMPLATE_MD),
  );

  for (const path of paths) {
    try {
      if (existsSync(path)) {
        return path;
      }
    } catch (err) {
      console.error(err);
    }
  }

  return "";
}

export function getPullRequestTemplateString() {
  const templatePath = findPullRequestTemplate();

  if (!templatePath) {
    console.error("Could not find pull request template, using blank");
    return "";
  }

  return readFileSync(templatePath).toString();
}

export function getGitRootDir() {
  const { stdout } = execaCommandSync("git rev-parse --show-toplevel");

  return stdout;
}

export function getTicketFromBranch(branchName = getCurrentBranch()) {
  const ticket = branchName.match(BRANCH_WITH_JIRA_TICKET)?.[0] ?? "";
  const remaining = branchName.replace(ticket, "");
  return { ticket, remaining };
}
