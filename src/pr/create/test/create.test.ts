import { describe, it, expect, vi, beforeEach, SpyInstance } from "vitest";
import * as git from "../../../lib/git";
import * as exec from "../../../lib/exec";
import * as firstup from "../../../lib/firstup";
import { createCommand } from "../create";
import prompts from "prompts";
import { CreateArgs } from "../types";

function generateArgs({
  title = undefined,
  body = undefined,
  draft = false,
}: Partial<CreateArgs> = {}) {
  return {
    title: title,
    body: body,
    draft: draft,
  } satisfies CreateArgs;
}

const testGetTicketFromBranchReturn = {
  ticket: "EE-123456",
  remaining: "testing-ticket-title",
};

describe("dev pr create", () => {
  let execTtySpy: SpyInstance<[command: string], Buffer> | undefined =
    undefined;
  beforeEach(() => {
    vi.spyOn(git, "isPwdGitRepo").mockImplementation(() => true);
    vi.spyOn(git, "getTicketFromBranch").mockReturnValue(
      testGetTicketFromBranchReturn,
    );
    execTtySpy = vi
      .spyOn(exec, "execTty")
      .mockImplementationOnce(() => vi.fn as unknown as Buffer);
  });

  it("should exit if directory is not a git repository", async () => {
    prompts.inject([undefined, undefined]);
    vi.spyOn(git, "isPwdGitRepo").mockImplementation(() => false);
    const processSpy = vi
      .spyOn(process, "exit")
      .mockImplementationOnce(vi.fn());

    await createCommand.handler(generateArgs());
    expect(processSpy).toBeCalledTimes(1);
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it("should forward all args to `gh pr create` when provided", () => {
    const testArgs = generateArgs({
      title: "test title",
      body: "test body",
      draft: true,
    });

    const expectedArgStrings: Record<keyof CreateArgs, string> = {
      title: `--title "${testArgs.title}"`,
      body: `--body "${testArgs.body}"`,
      draft: "--draft",
    };

    createCommand.handler(testArgs);

    for (const expected of Object.values(expectedArgStrings)) {
      expect(execTtySpy).toHaveBeenCalledWith(expect.stringMatching(expected));
    }
  });

  it("should use ticket info in branch name as initial title value", async () => {
    prompts.inject([]);

    const testArgs = generateArgs({ body: "test body" });

    await createCommand.handler(testArgs);

    expect(execTtySpy).toHaveBeenCalledOnce();
    expect(execTtySpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `--title "[${
          testGetTicketFromBranchReturn.ticket
        }] ${testGetTicketFromBranchReturn.remaining.replaceAll("-", " ")}"`,
      ),
    );
  });

  it("should offer and use repo `pull_request_template.md` as the body if one exists and is selected", async () => {
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

    expect(execTtySpy).toHaveBeenCalledOnce();
    expect(execTtySpy).toHaveBeenCalledWith(
      expect.stringContaining(`--body "${testPullRequestTemplate}"`),
    );
  });

  it("should set empty body if blank option is selected", async () => {
    prompts.inject(["blank"]);
    const testPullRequestTemplate = "test pull request template";
    vi.spyOn(git, "findPullRequestTemplate").mockReturnValue(
      "pull_request_template.md",
    );
    vi.spyOn(git, "getPullRequestTemplateString").mockReturnValueOnce(
      testPullRequestTemplate,
    );

    const testArgs = generateArgs({ title: "title" });

    await createCommand.handler(testArgs);

    expect(execTtySpy).toHaveBeenCalledOnce();
    expect(execTtySpy).toHaveBeenCalledWith(
      expect.stringContaining(`--body ""`),
    );
  });
});
