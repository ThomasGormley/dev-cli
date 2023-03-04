import prompts from "prompts";
import { describe, expect, it, vi } from "vitest";
import * as gitMock from "../../lib/git";
import { promptTitle } from "./prompts";

describe("promptTitle", () => {
  it("should fill initial field with ticket number and title", async () => {
    prompts.inject([]);
    const getTicketFromBranchMock = {
      ticket: "EE-123456",
      remaining: "this-is-the-remainder-title",
    };
    vi.spyOn(gitMock, "getTicketFromBranch").mockReturnValueOnce(
      getTicketFromBranchMock,
    );

    const title = await promptTitle();
    expect(title).toStrictEqual(
      `[${
        getTicketFromBranchMock.ticket
      }] ${getTicketFromBranchMock.remaining.replaceAll("-", " ")}`,
    );
  });
});
