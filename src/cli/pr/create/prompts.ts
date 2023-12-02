import {
  getRemoteBranches,
  getTicketFromBranch,
  PULL_REQUEST_TEMPLATE_MD,
} from "../../../lib/git";
import { z } from "zod";
import { zompt } from "../../../lib/zompt";
import { featureFlag } from "../../../lib/feature-flag";

const promptsSchema = z.object({
  title: z.string(),
  template: z.enum(["template", "blank"]),
  addCommitsAsChanges: z.boolean(),
  branch: z.string(),
});

export async function promptTitle() {
  const { ticket, remaining } = getTicketFromBranch();
  const remainingReplaceHyphens = remaining.replaceAll("-", " ");
  const branchNameWithoutTicket = remainingReplaceHyphens.startsWith(" ")
    ? remainingReplaceHyphens.slice(1)
    : remainingReplaceHyphens;
  const response = await zompt(promptsSchema.pick({ title: true }), {
    name: "title",
    type: "text",
    message: "Title",
    initial: ticket
      ? `[${ticket}] ${branchNameWithoutTicket}`
      : branchNameWithoutTicket,
  });

  return response.title;
}

export async function promptTemplateOrBlank() {
  const response = await zompt(promptsSchema.pick({ template: true }), {
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

export async function promptAddCommitsAsChanges() {
  const shouldPrompt = featureFlag.enabled("PromptForChangesListInBody");

  if (!shouldPrompt) {
    return false;
  }

  const response = await zompt(
    promptsSchema.pick({ addCommitsAsChanges: true }),
    {
      name: "addCommitsAsChanges",
      type: "confirm",
      message: "Add commits as changes?",
      initial: true,
    },
  );

  return response.addCommitsAsChanges;
}

export async function promptForBranch() {
  const branches = getRemoteBranches();
  const choices = branches.map((branch) => ({ title: branch, value: branch }));

  const response = await zompt(promptsSchema.pick({ branch: true }), {
    name: "branch",
    type: "autocomplete",
    choices: choices,
    message: "Branch",
  });

  return response.branch;
}
