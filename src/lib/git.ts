import { existsSync, readFileSync } from "fs";
import path from "path";
import { execOut } from "./exec";

export function isPwdGitRepo() {
  try {
    return Boolean(execOut("git rev-parse --is-inside-work-tree"));
  } catch (error) {
    return false;
  }
}

export function getCurrentBranch() {
  return execOut("git branch --show-current");
}

export const BRANCH_WITH_JIRA_TICKET = /[A-Z]+-[0-9]+/;

export const PULL_REQUEST_TEMPLATE_MD = "pull_request_template.md";
export function findPullRequestTemplate() {
  const templateLocations = [
    "./",
    "./github/PULL_REQUEST_TEMPLATE/",
    "./docs/",
  ];
  const root = getGitRootDir();
  const paths = templateLocations.map((dir) =>
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
  return execOut("git rev-parse --show-toplevel");
}

export function getTicketFromBranch(branchName = getCurrentBranch()) {
  const ticket = branchName.match(BRANCH_WITH_JIRA_TICKET)?.[0] ?? "";
  const remaining = branchName.replace(ticket, "");
  return { ticket, remaining };
}
