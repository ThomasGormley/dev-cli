import { command, option, optional, string, subcommands } from "cmd-ts";
import prompts from "prompts";
import { execOut, execTty } from "../lib/exec";

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
  },
  name: "create",
  handler: async ({ title }) => {
    if (!isPwdGitRepo()) {
      process.exit(1);
    }
    if (!title) {
      title = await promptPrTitle();
    }

    

    execTty(`gh pr create --title ${title}`);
  },
});

export const pr = subcommands({
  name: "pr",
  cmds: {
    create: createCommand,
  },
});

async function promptPrTitle() {
  const branchName = execOut("git branch --show-current");
  const branchPrefixPattern = /[A-Z]+-[0-9]+/;
  const ticket = branchPrefixPattern.exec(branchName)?.[0];
  console.log({ ticket: branchPrefixPattern.exec(branchName) });
  const response = await prompts({
    name: "title",
    type: "text",
    message: "Title",
    initial: ticket ? `[${ticket}] ` : undefined,
  });

  return response.title as string;
}

function isPwdGitRepo() {
  try {
    return Boolean(execOut("git rev-parse --is-inside-work-tree"));
  } catch (error) {
    return false;
  }
}
