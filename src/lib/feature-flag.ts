import { join } from "path";
import { z } from "zod";
import { readYamlFile, writeYamlFile } from "./yaml";
import { existsSync, mkdirSync } from "fs";
import { DEV_CLI_DIR, isDirectory } from "./config";

type FlagsOfType<TT extends boolean | string | number, TObj> = {
  [K in keyof TObj]: TObj[K] extends TT ? K : never;
}[keyof TObj];
type BooleanFlags<T> = FlagsOfType<boolean, T>;

export const defaultFeatureFlags = {
  boolean: false,
  string: "",
  number: 0,
} as const;

const booleanWithDefault = z.boolean().default(defaultFeatureFlags.boolean);

const featureFlagSchema = z.object({
  PromptForChangesListInBody: booleanWithDefault,
});

type FeatureFlags = z.infer<typeof featureFlagSchema>;

const FEATURE_FLAG_FILE_PATH = join(DEV_CLI_DIR, "flags.yml");

function createFlagDirectory() {
  const flagDir = isDirectory(DEV_CLI_DIR);

  if (!flagDir) {
    try {
      mkdirSync(DEV_CLI_DIR, { recursive: true });
    } catch (error) {
      throw new Error(
        `Could not create feature flag directory: ${DEV_CLI_DIR}`,
      );
    }
  }
}

export function init() {
  createFlagDirectory();

  if (!existsSync(FEATURE_FLAG_FILE_PATH)) {
    writeYamlFile(FEATURE_FLAG_FILE_PATH, defaultFeatureFlags);
  }
  const parsedYaml = featureFlagSchema.parse(
    existsSync(FEATURE_FLAG_FILE_PATH)
      ? readYamlFile(FEATURE_FLAG_FILE_PATH)
      : {},
  );
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
