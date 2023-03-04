import { describe, expect, it } from "vitest";
import { getTicketFromBranch } from "../git";

describe("getTicketFromBranch", () => {
  it("should extract ticket identifier and branch information", () => {
    const testBranches = ["EE-1", "EE-123", "AZ-123456"];

    for (const ticketNumber of testBranches) {
      const { ticket, remaining } = getTicketFromBranch(
        `${ticketNumber}-this-is-test-ticket`,
      );

      expect(ticket).toStrictEqual(ticketNumber);
      expect(remaining).toStrictEqual("-this-is-test-ticket");
    }
  });
});
