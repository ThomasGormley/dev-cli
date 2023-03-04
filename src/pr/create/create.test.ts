import { describe, it, expect, vi, beforeEach, SpyInstance } from "vitest";
import * as gitMock from "../../lib/git";
import * as testMock from './test'
import * as execMock from "../../lib/exec";
import { createCommand } from "./create";
import prompts from "prompts";
import { CreateArgs } from "./types";

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

describe("dev pr create", () => {
  let execTtySpy: SpyInstance<[command: string], Buffer> | undefined =
    undefined;
  beforeEach(() => {
    vi.spyOn(gitMock, "isPwdGitRepo").mockImplementation(() => true);
    execTtySpy = vi
      .spyOn(execMock, "execTty")
      .mockImplementationOnce(() => vi.fn as unknown as Buffer);
  });

  it("should exit if directory is not a git repository", async () => {
    prompts.inject([undefined, undefined]);
    vi.spyOn(gitMock, "isPwdGitRepo").mockImplementation(() => false);
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

  it.only("should use ticket in branch name as initial title value", async () => {
    prompts.inject([]);
    const branchSpy = vi
      .spyOn(gitMock, "getCurrentBranch")
      .mockImplementation(() => "impl-test");

    console.log({
      branchSpy: branchSpy.getMockName(),
      impl: branchSpy.getMockImplementation()?.toString(),
    });

    const testArgs = generateArgs({ body: "test body" });

    await createCommand.handler(testArgs);

    expect(execTtySpy).toHaveBeenCalledOnce();
    expect(execTtySpy).toHaveBeenCalledWith(
      expect.stringContaining("EE-123456"),
    );
  });
});
