const workstationDirectories = ["/socialchorus", "/firstup"];
export const isWorkstationRepo = workstationDirectories.some((dir) =>
  process.cwd().includes(dir),
);

export const FIRSTUP_JIRA_LINK_REGEX =
  /https:\/\/(firstup-io|socialcoders)\.atlassian\.net\/browse\/[A-Z]+-/;

export function getFirstupJiraUrl(ticket: string) {
  return new URL(`https://firstup-io.atlassian.net/browse/${ticket}`);
}
