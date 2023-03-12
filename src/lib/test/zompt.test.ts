import prompts from "prompts";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zompt } from "../zompt";

describe("zompt", () => {
  it("should return parsed object when parsing succeedes", async () => {
    prompts.inject(["test", true]);
    const testSchema = z.object({
      string: z.string(),
      boolean: z.boolean(),
    });

    const answers = await zompt(testSchema, [
      {
        name: "string",
        type: "text",
        message: "test",
      },
      {
        name: "boolean",
        type: "confirm",
        message: "test",
      },
    ]);

    expect(answers).toStrictEqual({
      string: "test",
      boolean: true,
    });
  });
});
