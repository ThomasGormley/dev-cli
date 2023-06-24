import { describe, it, expect, vi, beforeEach } from "vitest";
import * as git from "../../../../lib/git";
import { createCommand } from "../create";
import { CreateArgs } from "../types";
import prompts from "prompts";
import { execa } from "execa";

function generateArgs({
  title = undefined,
  body = undefined,
  draft = false,
  rest = [],
}: CreateArgs = {}) {
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
  });

  it("should forward all args to `gh pr create` when provided", async () => {
    // const execSpy = vi.spyOn(exec, "exec");
    const testArgs = generateArgs({
      title: "test title",
      body: "test body",
      draft: true,
      rest: "-B rest",
    });

    // given this code:
    // ```
    // const args = [
    //   "pr",
    //   "create",
    //   title ? `--title=${title}` : "",
    //   body || body === "" ? `--body=${body}` : "",
    //   draft ? "--draft" : "",
    //   ...(rest || []),
    // ].filter(Boolean);

    // console.log(args.join(" "));

    // await execa("gh", args, { all: true, stdio: "inherit" });
    // ```
    // write an expectation in a loop that `execa` is called with the following arguments:
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
        ...Object.values(expectedArgStrings),
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
