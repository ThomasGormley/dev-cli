import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as gitMock from "../../lib/git";
import * as execMock from "../../lib/exec";
import { createCommand } from "./create";
import prompts from "prompts";

describe("dev pr create", () => {
  beforeEach(() => {
    vi.spyOn(gitMock, "isPwdGitRepo").mockImplementationOnce(() => true);
    vi.spyOn(gitMock, "getCurrentBranch").mockImplementation(
      () => "EE-123456-testing-branch-feature",
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should exit if directory is not a git repository", () => {
    vi.spyOn(gitMock, "isPwdGitRepo").mockImplementationOnce(() => false);
    const processSpy = vi
      .spyOn(process, "exit")
      .mockImplementationOnce(vi.fn());

    createCommand.handler({ title: undefined, body: undefined });
    expect(processSpy).toBeCalledTimes(1);
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it("should forward title & body to `gh pr create` when args provided", () => {
    const execTtySpy = vi
      .spyOn(execMock, "execTty")
      .mockImplementationOnce(() => vi.fn as unknown as Buffer);
    const testArgs = { title: "test title", body: "test body" };
    createCommand.handler(testArgs);

    expect(execTtySpy).toHaveBeenCalledWith(
      expect.stringMatching(`--title ${testArgs.title}`),
    );
    expect(execTtySpy).toHaveBeenCalledWith(
      expect.stringMatching(`--body '${testArgs.body}'`),
    );
  });

  it.skip("should use ticket in branch name as initial title value", () => {
    prompts.inject(["EE-123456"]);
    const execTtySpy = vi
      .spyOn(execMock, "execTty")
      .mockImplementationOnce(() => vi.fn as unknown as Buffer);
    const testArgs = { title: undefined, body: "test body" };
    createCommand.handler(testArgs);

    expect(execTtySpy).toHaveBeenCalledOnce();
  });
});
