import prompts, { PromptObject } from "prompts";
import { z } from "zod";

type Questions<TPrompts extends string> =
  | prompts.PromptObject<TPrompts>
  | Array<prompts.PromptObject<TPrompts>>;
type Options = prompts.Options;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function zompt<TShape extends Record<string, any>>(
  schema: z.ZodObject<TShape>,
  questions: Questions<keyof TShape & string>,
  options: Options = {},
) {
  if (!Array.isArray(questions)) {
    questions = [questions];
  }
  const questionsWithZodValidation = buildQuestionsWithZodValidation(
    schema,
    questions,
  );

  return schema.parse(await prompts(questionsWithZodValidation, options));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuestionsWithZodValidation<TShape extends Record<string, any>>(
  schema: z.ZodObject<TShape>,
  questions: prompts.PromptObject<keyof TShape & string>[],
) {
  return questions.map((question) => {
    const questionParser = schema.shape[question.name as string];

    if (!(questionParser instanceof z.ZodObject)) {
      return question;
    }

    const validator = mergeValidateAndZodParse(questionParser, question);

    return Object.assign({}, question, {
      validate: validator,
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeValidateAndZodParse<TShape extends Record<string, any>>(
  questionParser: z.ZodObject<TShape>,
  question: prompts.PromptObject<keyof TShape & string>,
) {
  const fn: PromptObject["validate"] = (val) => {
    const parsed = questionParser.safeParse(val);

    if (!parsed.success) {
      const formatted = parsed.error.format();
      return formatted._errors.join(". ");
    }

    if (typeof question.validate === "function") {
      // This type signature isn't correct
      // validate only ever gets passed the value
      // https://github.com/terkelg/prompts/blob/771ff1d0f246774ebf9423804a8a2d825dbe23ed/lib/elements/text.js#L73
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return question.validate(val);
    }

    return true;
  };

  return fn;
}
