import { execa, ExecaError, Options } from "execa";

export function isExecaError(error: unknown): error is ExecaError {
  return Object.hasOwnProperty.call(error, "shortMessage");
}

export async function exec(
  file: string,
  args: string[] = [],
  options?: Options,
) {
  try {
    return await execa(file, args, {
      all: true,
      stdio: "inherit",
      ...options,
    });
  } catch (error) {
    if (isExecaError(error)) {
      process.exit(error.exitCode);
    }

    throw error;
  }
}

export function escapeSpaces(string: string) {
  return string.replaceAll(" ", "\\");
}
