import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { parse as yamlParse } from "yaml";
import { PKG_ROOT } from "./internal";
import { z } from "zod";

type FlagsOfType<TT extends boolean | string | number, TObj> = {
  [K in keyof TObj]: TObj[K] extends TT ? K : never;
}[keyof TObj];
type BooleanFlags<T> = FlagsOfType<boolean, T>;

const defaultValues = {
  boolean: false,
  string: "",
  number: 0,
} as const;

const booleanWithDefault = z.boolean().default(defaultValues.boolean);

const featureFlagSchema = z.object({
  PromptForChangesListInBody: booleanWithDefault,
});

type FeatureFlags = z.infer<typeof featureFlagSchema>;

const flagsYml = join(PKG_ROOT, "flags.yml");
const flagsYmlExists = existsSync(flagsYml);
const flagsYmlBuffer = flagsYmlExists ? readFileSync(flagsYml, "utf8") : "";

export function init() {
  const parsedYaml = featureFlagSchema.parse(yamlParse(flagsYmlBuffer) ?? {});
  const featureFlagMap = new Map<
    keyof FeatureFlags,
    boolean | string | number
  >();

  for (const [key, value] of Object.entries(parsedYaml)) {
    featureFlagMap.set(
      key as keyof FeatureFlags,
      value as FeatureFlags[keyof FeatureFlags],
    );
  }

  function findFlag(flagName: keyof FeatureFlags) {
    const flag = featureFlagMap.get(flagName);
    if (flag === undefined) {
      throw new Error(`Unknown flag ${String(flagName)}.`);
    }
    return flag;
  }

  function enabled(flagName: BooleanFlags<FeatureFlags>) {
    const flag = findFlag(flagName);
    if (typeof flag !== "boolean") {
      throw new Error(`non-boolean flag ${String(flagName)}.`);
    }
    return flag;
  }

  return {
    findFlag,
    enabled,
  };
}

export const featureFlag = init();
