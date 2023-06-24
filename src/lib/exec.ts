import { execa, ExecaError } from "execa";

export function isExecaError(error: unknown): error is ExecaError {
  return Object.hasOwnProperty.call(error, "shortMessage");
}

export async function exec(file: string, args: string[] = []) {
  try {
    return await execa(file, args, {
      all: true,
      stdio: "inherit",
    });
  } catch (error) {
    if (isExecaError(error)) {
      process.exit(error.exitCode);
    }
  }
}

export function escapeSpaces(string: string) {
  return string.replaceAll(" ", "\\");
}
