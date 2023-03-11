import prompts from "prompts";
import { z } from "zod";

type Questions<TPrompts extends string> =
  | prompts.PromptObject<TPrompts>
  | Array<prompts.PromptObject<TPrompts>>;
type Options = prompts.Options;

export async function zompt<TShape extends Record<string, unknown>>(
  schema: z.Schema<TShape>,
  questions: Questions<keyof TShape & string>,
  options: Options = {},
) {
  const parsed = schema.safeParse(await prompts(questions, options));
  if (parsed.success) {
    return parsed.data;
  } else {
    throw new Error(parsed.error.toString());
  }
}
