import { execaCommand, execaCommandSync, ExecaError } from "execa";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isExecaError = (err: any): err is ExecaError => {
  return "all" in err;
};

export async function exec(command: string) {
  try {
    return await execaCommand(command, {
      all: true,
      stdio: "inherit",
    });
  } catch (error) {
    if (isExecaError(error)) {
      throw new Error(error.message);
    }

    return "Unknown error";
  }
}
export function execSync(command: string) {
  return execaCommandSync(command, { stdio: "inherit", all: true });
}

export function escapeSpaces(string: string) {
  return string.replaceAll(" ", "\\");
}
