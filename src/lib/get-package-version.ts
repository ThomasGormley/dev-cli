import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

export const getPackageVersion = () => {
  const packageJsonPath = path.join(PKG_ROOT, "package.json");
  const packageJsonContent = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return (packageJsonContent.version ?? "1.0.0") as string;
};
