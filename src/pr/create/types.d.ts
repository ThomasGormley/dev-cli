import { Output } from "../../types/cmd-ts";
import { createArgs } from "./create";

export type CreateArgs = Output<typeof createArgs>;

export type CreatePrompts = {
    title: string,
    template: "template" | "blank"
}