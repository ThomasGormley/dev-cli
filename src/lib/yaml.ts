import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";

export function readYamlFile(filePath: string) {
  const buffer = readFileSync(filePath, "utf8");
  return parse(buffer) as unknown;
}

export function writeYamlFile(filePath: string, data: unknown) {
  const yaml = stringify(data);
  return writeFileSync(filePath, yaml);
}
