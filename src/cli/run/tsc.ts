import { command, rest } from "cmd-ts";
import { exec } from "../../lib/exec";
import { hasAnyDep } from "../../lib/package";
import { Output } from "../../types/cmd-ts";

type TscArgs = Output<typeof tscArgs>;

export const tscArgs = {
  tscOpts: rest({
    displayName: "tsc arguments",
    description: "All the flags and arguments you would normally pass to `tsc`",
  }),
};

export function tscHandler({ tscOpts }: TscArgs) {
  if (!hasAnyDep("typescript")) {
    console.error("You must have `typescript` installed to use this command.");
    process.exit(1);
  }

  exec("tsc", tscOpts, { preferLocal: true });
}

export const tscCommand = command({
  args: tscArgs,
  name: "tsc",
  handler: tscHandler,
});
