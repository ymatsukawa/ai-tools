import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type PickDirectoryResult =
  | { path: string }
  | { canceled: true }
  | { error: string };

const PICKER_SCRIPT = `
tell application "Finder"
  activate
  POSIX path of (choose folder with prompt "Select a git repository")
end tell
`;

export async function loader(): Promise<PickDirectoryResult> {
  let picked: string;
  try {
    const { stdout } = await execFileAsync("osascript", ["-e", PICKER_SCRIPT]);
    picked = stdout.trim().replace(/\/$/, "");
  } catch (e) {
    const err = e as Error & { stderr?: string };
    if (err.stderr?.includes("-128")) return { canceled: true };
    return { error: "Failed to open the directory picker (macOS only)." };
  }
  if (!existsSync(join(picked, ".git"))) {
    return {
      error: `Not a git repository: ".git" was not found in ${picked}`,
    };
  }
  return { path: picked };
}
