import { config } from "../../../lib/config";
import { exec } from "../../../lib/exec";
import { isWorkstationRepo } from "../../../lib/firstup";
import {
  branchExists,
  getPullRequestTemplateString,
  isAuthenticated,
  isDirGitRepo,
} from "../../../lib/git";
import { applyTransformationsToString } from "../../../lib/string";
import { defaultPrTemplate } from "./lib/constants";
import { getFirstupTemplateTransformations } from "./lib/transformations";
import {
  promptAddCommitsAsChanges,
  promptForBranch,
  promptTitle,
} from "./prompts";
import { CreateArgs } from "./types";

function extractRestArgs(rest: string[]): string[] {
  return rest.map((arg) => arg.split(" ")).flat();
}

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

  let branch = config.teamBranch;
  const branchExistsOnRemote = branch ? branchExists(branch) : false;

  const argsHasBaseBranchFlag = rest.some(
    (arg) => arg.startsWith("--base") || arg.startsWith("-B"),
  );

  // Only prompt for branch if the config branch doesn't exist on remote
  // and the user didn't provide a branch as an argument
  if (branch && !branchExistsOnRemote && !argsHasBaseBranchFlag) {
    console.log(`Branch "${branch}" does not exist on remote.`);
    console.log("Please choose another branch to open the PR against.");
    branch = await handleBranch();
  }

  const args = [
    "pr",
    "create",
    title ? `--title=${title}` : `--title=""`,
    body && `--body=${body}`,
    draft ? "--draft" : "",
    branch && `--base=${branch}`,
    ...extractRestArgs(rest),
  ].filter((arg): arg is string => Boolean(arg));

  await exec("gh", args);
}

async function handleTitle() {
  return promptTitle();
}

async function handleBody() {
  if (isWorkstationRepo) {
    return handleFirstupTemplate();
  }

  return undefined;
}

async function handleBranch() {
  return promptForBranch();
}

async function handleFirstupTemplate() {
  const template = getPullRequestTemplateString() || defaultPrTemplate;
  console.log("Using default PR template");
  const addCommitsAsChanges = await promptAddCommitsAsChanges();
  const transformedTemplate = applyTransformationsToString(
    template,
    getFirstupTemplateTransformations({ addCommitsAsChanges }),
  );

  return transformedTemplate;
}
