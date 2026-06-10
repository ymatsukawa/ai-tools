import type { DiffHunk, DiffLine, FileDiff, FileStatus } from "~/types/diff";

interface NameStatusLike {
  status: string;
  path: string;
  oldPath: string | null;
}

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@ ?(.*)$/;

export function parseDiff(
  patch: string,
  nameStatus: NameStatusLike[],
): FileDiff[] {
  const parser = new DiffParser(nameStatus);
  for (const line of patch.split("\n")) {
    parser.consume(line);
  }
  return parser.files;
}

class DiffParser {
  readonly files: FileDiff[] = [];

  private current: FileDiff | null = null;
  private hunk: DiffHunk | null = null;
  private oldLineNo = 0;
  private newLineNo = 0;
  private oldRemain = 0;
  private newRemain = 0;

  constructor(private readonly nameStatus: NameStatusLike[]) {}

  consume(line: string): void {
    if (line.startsWith("diff --git ")) {
      this.startFile(line);
      return;
    }
    if (!this.current) return;

    if (line.startsWith("Binary files ") || line === "GIT binary patch") {
      this.current.binary = true;
      this.hunk = null;
      return;
    }

    const hunkMatch = HUNK_RE.exec(line);
    if (hunkMatch) {
      this.startHunk(line, hunkMatch);
      return;
    }
    this.consumeHunkLine(line);
  }

  private startFile(headerLine: string): void {
    // Paths/statuses come from `--name-status -z` output zipped by index;
    // the `diff --git a/x b/y` header is ambiguous for paths with spaces.
    const entry = this.nameStatus[this.files.length];
    this.current = {
      path: entry?.path ?? headerLine.slice("diff --git ".length),
      oldPath: entry?.oldPath ?? null,
      status: entry ? toFileStatus(entry.status) : "modified",
      binary: false,
      additions: 0,
      deletions: 0,
      hunks: [],
    };
    this.files.push(this.current);
    this.hunk = null;
  }

  private startHunk(header: string, match: RegExpExecArray): void {
    // Omitted counts in "@@ -a +c @@" mean a single line.
    this.oldLineNo = Number(match[1]);
    this.newLineNo = Number(match[3]);
    this.oldRemain = match[2] !== undefined ? Number(match[2]) : 1;
    this.newRemain = match[4] !== undefined ? Number(match[4]) : 1;

    this.hunk = {
      header,
      oldStart: this.oldLineNo,
      oldLines: this.oldRemain,
      newStart: this.newLineNo,
      newLines: this.newRemain,
      lines: [],
    };
    this.current!.hunks.push(this.hunk);
  }

  private consumeHunkLine(line: string): void {
    // Guard against trailing blank lines after a completed hunk.
    if (!this.hunk || (this.oldRemain <= 0 && this.newRemain <= 0)) return;

    if (line.startsWith("+")) {
      this.pushAddLine(line);
      return;
    }
    if (line.startsWith("-")) {
      this.pushDelLine(line);
      return;
    }
    if (line.startsWith(" ") || line === "") {
      this.pushContextLine(line);
      return;
    }
    // "\ No newline at end of file" and other metadata: skip.
  }

  private pushAddLine(line: string): void {
    this.pushLine({
      type: "add",
      content: line.slice(1),
      oldLineNo: null,
      newLineNo: this.newLineNo++,
    });
    this.current!.additions++;
    this.newRemain--;
  }

  private pushDelLine(line: string): void {
    this.pushLine({
      type: "del",
      content: line.slice(1),
      oldLineNo: this.oldLineNo++,
      newLineNo: null,
    });
    this.current!.deletions++;
    this.oldRemain--;
  }

  private pushContextLine(line: string): void {
    this.pushLine({
      type: "context",
      content: line.slice(1),
      oldLineNo: this.oldLineNo++,
      newLineNo: this.newLineNo++,
    });
    this.oldRemain--;
    this.newRemain--;
  }

  private pushLine(diffLine: DiffLine): void {
    this.hunk!.lines.push(diffLine);
  }
}

function toFileStatus(code: string): FileStatus {
  switch (code) {
    case "A":
    case "C":
      return "added";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    default:
      return "modified";
  }
}
