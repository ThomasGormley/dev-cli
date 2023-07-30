import {
  FIRSTUP_JIRA_LINK_REGEX,
  getFirstupJiraUrl,
} from "../../../../lib/firstup";
import { getGitChangeMessages, getTicketFromBranch } from "../../../../lib/git";
import { TransformationFunction } from "../../../../lib/string";

export const addChangesToBodyTransformation = (body: string): string => {
  console.log("Fetching changes...");
  const changesHeader = "**Changes**";
  const hasChangesHeader = body.includes(changesHeader);
  // append markdown bulletpoint before each change message on a new line
  const changesList = `\n${getGitChangeMessages()
    .map((change) => `- ${change}`)
    .join("\n")}`;

  const hasChanges = changesList.length > 0;

  if (!hasChanges) {
    console.log("No changes found");
  } else {
    console.log("Changes found");
    console.log(changesList);
  }
  return hasChangesHeader && hasChanges
    ? body.replace(changesHeader, changesHeader + changesList)
    : body;
};

export function getFirstupTemplateTransformations({
  addCommitsAsChanges,
}: {
  addCommitsAsChanges: boolean;
}) {
  const transformations: TransformationFunction[] = [
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
  ];

  if (addCommitsAsChanges) {
    transformations.push(addChangesToBodyTransformation);
  }

  return transformations;
}
