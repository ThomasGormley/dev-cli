import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { PackageJson } from "type-fest";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

function resolvePackageJson() {
  const packageJsonPath = path.join(PKG_ROOT, "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson;
}

export const getPackageVersion = () => {
  const packageJsonContent = resolvePackageJson();
  return packageJsonContent.version ?? "1.0.0";
};

export function hasDep(name: string) {
  const packageJsonContent = resolvePackageJson();
  return Boolean(packageJsonContent.dependencies?.[name]);
}

export function hasDevDep(name: string) {
  const packageJsonContent = resolvePackageJson();
  return Boolean(packageJsonContent.devDependencies?.[name]);
}

export function hasPeerDep(name: string) {
  const packageJsonContent = resolvePackageJson();
  return Boolean(packageJsonContent.peerDependencies?.[name]);
}

export function hasAnyDep(name: string) {
  return hasDep(name) || hasDevDep(name) || hasPeerDep(name);
}

export function hasFile(name: string) {
  return existsSync(path.join(PKG_ROOT, name));
}
