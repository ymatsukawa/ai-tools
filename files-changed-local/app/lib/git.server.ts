import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_MAX_BUFFER = 1024 * 1024;
const DIFF_MAX_BUFFER = 64 * 1024 * 1024;

export class GitError extends Error {}

async function git(
  repoPath: string,
  args: string[],
  maxBuffer = DEFAULT_MAX_BUFFER,
): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repoPath, ...args], {
      maxBuffer,
    });
    return stdout;
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { stderr?: string };
    if (err.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
      throw new GitError("Diff too large to display");
    }
    throw new GitError(err.stderr?.trim() || err.message);
  }
}

export async function validateRepo(repoPath: string): Promise<string | null> {
  try {
    const s = await stat(repoPath);
    if (!s.isDirectory()) return "Path is not a directory";
  } catch {
    return "Path does not exist";
  }
  if (!existsSync(join(repoPath, ".git"))) {
    return 'Not a git repository: ".git" was not found in the selected directory';
  }
  try {
    await git(repoPath, ["rev-parse", "--is-inside-work-tree"]);
  } catch {
    return "Path is not a git repository";
  }
  return null;
}

export async function listBranches(repoPath: string): Promise<string[]> {
  const out = await git(repoPath, [
    "for-each-ref",
    "refs/heads",
    "--format=%(refname:short)",
  ]);
  return out.split("\n").filter(Boolean);
}

export async function currentBranch(repoPath: string): Promise<string | null> {
  try {
    const out = await git(repoPath, ["symbolic-ref", "--short", "-q", "HEAD"]);
    return out.trim() || null;
  } catch {
    return null;
  }
}

export type FileStatusCode = "A" | "M" | "D" | "R" | "C" | "T";

export interface NameStatusEntry {
  status: FileStatusCode;
  path: string;
  oldPath: string | null;
}

// Three-dot range = diff against the merge base, matching what a GitHub PR
// "files changed" page shows (commits added to base after branching are ignored).
function mergeBaseRange(base: string, head: string): string {
  return `${base}...${head}`;
}

export async function diffNameStatus(
  repoPath: string,
  base: string,
  head: string,
): Promise<NameStatusEntry[]> {
  const out = await git(
    repoPath,
    ["diff", "--name-status", "-z", "-M", mergeBaseRange(base, head)],
    DIFF_MAX_BUFFER,
  );
  return parseNameStatusTokens(out.split("\0").filter((t) => t !== ""));
}

// -z output is NUL-delimited: "M\0path" for most entries, while renames and
// copies carry two paths: "R100\0old\0new".
function parseNameStatusTokens(tokens: string[]): NameStatusEntry[] {
  const entries: NameStatusEntry[] = [];

  let i = 0;
  while (i < tokens.length) {
    const code = tokens[i][0] as FileStatusCode;
    if (code === "R" || code === "C") {
      entries.push({ status: code, oldPath: tokens[i + 1], path: tokens[i + 2] });
      i += 3;
    } else {
      entries.push({ status: code, oldPath: null, path: tokens[i + 1] });
      i += 2;
    }
  }
  return entries;
}

export async function diffPatch(
  repoPath: string,
  base: string,
  head: string,
): Promise<string> {
  return git(
    repoPath,
    ["diff", "--no-color", "--no-ext-diff", "-M", mergeBaseRange(base, head)],
    DIFF_MAX_BUFFER,
  );
}
