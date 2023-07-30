import { existsSync, readFileSync } from "fs";
import path from "path";
import type { PackageJson } from "type-fest";

export function findPackageJsonPath(cwd: string = process.cwd()): string {
  const packageJsonPath = path.join(cwd, "package.json");
  if (existsSync(packageJsonPath)) {
    return packageJsonPath;
  }
  const parentDir = path.dirname(cwd);
  if (parentDir === cwd) {
    console.error("Could not find package.json file.");
    process.exit(1);
  }
  return findPackageJsonPath(parentDir);
}

export function resolvePackageJson(cwd: string = process.cwd()) {
  const packageJsonPath = findPackageJsonPath(cwd);
  return JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson;
}

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
