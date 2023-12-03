import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";

// Type guard to check if an object is a Record
function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null;
}

function replaceEnvVariables(obj: unknown) {
  if (typeof obj === "string") {
    return obj.replace(
      /\${(.+?)(?::(.*?))?}/g,
      (_: string, envKey: string, defaultValue = "") => {
        return process.env[envKey] ?? defaultValue;
      },
    );
  } else if (isRecord(obj)) {
    for (const key in obj) {
      obj[key] = replaceEnvVariables(obj[key]);
    }
  }
  return obj;
}

export function readYamlFile(filePath: string) {
  const buffer = readFileSync(filePath, "utf8");
  return replaceEnvVariables(parse(buffer)) as unknown;
}

export function writeYamlFile(filePath: string, data: unknown) {
  const yaml = stringify(data);
  return writeFileSync(filePath, yaml);
}
