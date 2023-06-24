import path from "path";
import { fileURLToPath } from "url";
import { resolvePackageJson } from "./package";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

export const getPackageVersion = () => {
  const packageJsonContent = resolvePackageJson(PKG_ROOT);
  return packageJsonContent.version ?? "1.0.0";
};
