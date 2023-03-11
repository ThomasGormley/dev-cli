import { describe, it, expect, vi, beforeEach } from "vitest";
import * as git from "../../../../lib/git";
import * as exec from "../../../../lib/exec";
import { createCommand } from "../create";
import { CreateArgs } from "../types";
import prompts from "prompts";

function generateArgs({
  title = undefined,
  body = undefined,
  draft = false,
  rest = [],
}: Partial<CreateArgs> = {}) {
  return {
    title: title,
    body: body,
    draft: draft,
    rest: rest,
  } satisfies CreateArgs;
}

describe("dev pr create", () => {
  beforeEach(() => {
    vi.spyOn(git, "isDirGitRepo").mockReturnValue(Promise.resolve(true));
    vi.spyOn(git, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(git, "getCurrentBranch").mockReturnValue(
      "EE-123456-testing-ticket-title",
    );
  });

  it("should forward all args to `gh pr create` when provided", async () => {
    const execSpy = vi.spyOn(exec, "exec");
    const testArgs = generateArgs({
      title: "test title",
      body: "test body",
      draft: true,
    });

    const expectedArgStrings: Record<keyof CreateArgs, string> = {
      title: `--title "${exec.escapeSpaces(testArgs.title ?? "")}"`,
      body: `--body "${exec.escapeSpaces(testArgs.body ?? "")}"`,
      draft: "--draft",
      rest: "",
    };

    await createCommand.handler(testArgs);

    for (const expected of Object.values(expectedArgStrings)) {
      expect(execSpy).toHaveBeenCalledWith(expect.stringContaining(expected));
    }
  });

  it("should offer and use repo `pull_request_template.md` as the body if one exists and is selected", async () => {
    const execaSpy = vi.spyOn(exec, "exec");
    prompts.inject(["template"]);
    const testPullRequestTemplate = "test pull request template";
    vi.spyOn(git, "findPullRequestTemplate").mockReturnValue(
      "pull_request_template.md",
    );
    vi.spyOn(git, "getPullRequestTemplateString").mockReturnValueOnce(
      testPullRequestTemplate,
    );

    const testArgs = generateArgs({ title: "title" });

    await createCommand.handler(testArgs);

    expect(execaSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `--body "${exec.escapeSpaces(testPullRequestTemplate)}"`,
      ),
    );
  });
});
