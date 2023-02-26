export const isWorkstationRepo = process.cwd().includes("/socialchorus/");

export const FIRSTUP_JIRA_LINK_REGEX =
  /https:\/\/firstup-io.atlassian.net\/browse\/[A-Z]+-/;

export function getFirstupJiraUrl(ticket: string) {
  return new URL(`https://firstup-io.atlassian.net/browse/${ticket}`);
}
