export type FileStatus = "added" | "modified" | "deleted" | "renamed";

export interface DiffLine {
  type: "context" | "add" | "del";
  content: string;
  oldLineNo: number | null;
  newLineNo: number | null;
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  oldPath: string | null;
  status: FileStatus;
  binary: boolean;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface CompareData {
  repoPath: string;
  branches: string[];
  currentBranch: string | null;
  base: string;
  head: string;
  files: FileDiff[];
  totalAdditions: number;
  totalDeletions: number;
}

export type LoaderResult =
  | { stage: "empty" }
  | {
      stage: "error";
      message: string;
      repoPath: string;
      branches?: string[];
      currentBranch?: string | null;
      base?: string;
      head?: string;
    }
  | ({ stage: "ready" } & CompareData);
