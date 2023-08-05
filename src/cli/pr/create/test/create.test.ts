import { describe, it, expect, vi, beforeEach } from "vitest";
import * as git from "../../../../lib/git";
import { createCommand } from "../create";
import { CreateArgs } from "../types";
import prompts from "prompts";
import { execa } from "execa";
import { omit } from "../../../../lib/object-utils";

function generateArgs({
  title = undefined,
  body = undefined,
  draft = false,
  rest = [],
}: Partial<CreateArgs>) {
  return {
    title: title,
    body: body,
    draft: draft,
    rest: rest,
  } satisfies CreateArgs;
}

vi.mock("execa");

describe("dev pr create", () => {
  beforeEach(() => {
    vi.spyOn(git, "isDirGitRepo").mockReturnValue(Promise.resolve(true));
    vi.spyOn(git, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(git, "getCurrentBranch").mockReturnValue(
      "EE-123456-testing-ticket-title",
    );
    vi.spyOn(git, "getGitChangeMessages").mockReturnValue(["main"]);
  });

  it("should forward all args to `gh pr create` when provided", async () => {
    const testArgs = generateArgs({
      title: "test title",
      body: "test body",
      draft: true,
      rest: ["-B rest"],
    });

    const expectedArgStrings: Record<keyof CreateArgs, string> = {
      title: `--title=${testArgs.title ?? ""}`,
      body: `--body=${testArgs.body ?? ""}`,
      draft: "--draft",
      rest: "-B rest",
    };

    await createCommand.handler(testArgs);

    expect(execa).toHaveBeenCalledWith(
      "gh",
      expect.arrayContaining([
        "pr",
        "create",
        ...Object.values(omit(expectedArgStrings, "rest")),
        "-B",
        "rest",
      ]),
      expect.anything(),
    );
  });

  it.skip("should offer and use repo `pull_request_template.md` as the body if one exists and is selected", async () => {
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

    expect(execa).toHaveBeenCalledWith(
      expect.stringContaining(`--body "${testPullRequestTemplate}"`),
    );
  });
});
