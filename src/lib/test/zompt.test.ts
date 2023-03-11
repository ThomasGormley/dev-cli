import prompts from "prompts";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zompt } from "../zompt";
describe("zompt", () => {
  it("should parse according to schema", async () => {
    prompts.inject(["test", true, 123]);
    const testSchema = z.object({
      string: z.string(),
      boolean: z.boolean(),
      coercion: z.coerce.number(),
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
      {
        name: "coercion",
        type: "confirm",
        message: "test",
      },
    ]);

    expect(answers).toBeDefined();
  });
});
