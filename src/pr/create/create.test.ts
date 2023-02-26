import { describe, it, expect, vi } from "vitest";
import * as gitMock from "../../lib/git";
import * as execMock from "../../lib/exec";
import { createCommand } from "./create";
describe("dev pr create", () => {
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
    vi.spyOn(gitMock, "isPwdGitRepo").mockImplementationOnce(() => true);
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
});
