import { ArgParser, ParsingInto } from "cmd-ts/dist/cjs/argparser";
import { ProvidesHelp } from "cmd-ts/dist/cjs/helpdoc";

type ArgTypes = Record<string, ArgParser<unknown> & Partial<ProvidesHelp>>;
export type Output<Args extends ArgTypes> = {
  [key in keyof Args]: ParsingInto<Args[key]>;
};
