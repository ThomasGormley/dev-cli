import prompts from "prompts";
import { getTicketFromBranch, PULL_REQUEST_TEMPLATE_MD } from "../../lib/git";
import { CreatePrompts } from "./types";

export async function promptTitle() {
  const { ticket, remaining } = getTicketFromBranch();
  const remainingReplaceHyphens = remaining.replaceAll("-", " ");
  const branchNameWithoutTicket = remainingReplaceHyphens.startsWith(" ")
    ? remainingReplaceHyphens.slice(1)
    : remainingReplaceHyphens;
  const response = await prompts({
    name: "title",
    type: "text",
    message: "Title",
    initial: ticket ? `[${ticket}] ${branchNameWithoutTicket}` : undefined,
  });

  return response.title as CreatePrompts["title"];
}

export async function promptTemplateOrBlank() {
  const response = await prompts({
    name: "template",
    type: "select",
    message: "Choose a template",
    choices: [
      { title: PULL_REQUEST_TEMPLATE_MD, value: "template" },
      { title: "Open a blank pull request", value: "blank" },
    ],
  });

  return response.template as CreatePrompts["template"];
}
