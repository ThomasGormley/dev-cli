import { lstatSync, readFileSync } from "fs";
import { mkdir } from "fs/promises";
import { homedir } from "os";
import path from "path";
import XDGAppPaths from "xdg-app-paths";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { z } from "zod";
import fs from "fs";
import { raise } from "./error";
import { readYamlFile, writeYamlFile } from "./yaml";

// Returns whether a directory exists
export const isDirectory = (path: string): boolean => {
  try {
    return lstatSync(path).isDirectory();
  } catch (_) {
    // We don't care which kind of error occured, it isn't a directory anyway.
    return false;
  }
};

// Returns in which directory the config should be present
export const getGlobalPathConfig = (): string => {
  const configDirs = XDGAppPaths("dev-cli").dataDirs();

  const possibleConfigPaths = [
    ...configDirs,
    path.join(homedir(), ".config", "dev-cli"),
  ];

  console.log(possibleConfigPaths);

  return (
    possibleConfigPaths.find((configPath) => isDirectory(configPath)) ||
    configDirs[0] ||
    raise("Could not find a valid config directory.")
  );
};

const DEV_CLI_DIR = getGlobalPathConfig();
const CONFIG_FILE_PATH = path.join(DEV_CLI_DIR, "config.yml");

const defaultConfig = {
  flagsFile: `${DEV_CLI_DIR}/flags.yml`,
} as const;

const CliConfigSchema = z.object({
  flagsFile: z.string(),
});

export type CliConfig = z.infer<typeof CliConfigSchema>;

function readConfig() {
  const config = CliConfigSchema.parse(readYamlFile(CONFIG_FILE_PATH) ?? {});
  return config;
}

function writeToConfig(config: CliConfig) {
  writeYamlFile(CONFIG_FILE_PATH, config);
  return readConfig();
}

export async function initConfigDirectory() {
  const cliConfigDir = isDirectory(DEV_CLI_DIR);

  if (!cliConfigDir) {
    await mkdir(DEV_CLI_DIR, { recursive: true }).catch((err: unknown) => {
      throw new Error(
        `Could not create config directory at ${DEV_CLI_DIR}: ${err}`,
      );
    });
  }

  let config: CliConfig;
  try {
    config = readConfig();
  } catch (err) {
    config = writeToConfig(defaultConfig);
  }

  return config;
}
