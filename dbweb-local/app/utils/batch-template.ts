// Pseudo-batch placeholders: a SQL template containing {seq}/{hash}/{date}
// tokens expands into N concrete statements (one per row index).

export const MAX_BATCH_ROWS = 10_000;

export const PLACEHOLDER_DOCS = [
  {
    syntax: "{seq:from-1-to-100}",
    description: "Sequential number, 1 to 100. Determines the batch size (here 100 rows).",
  },
  {
    syntax: "{seq:to-100}",
    description: "Same as above with `from` defaulting to 1.",
  },
  {
    syntax: "{hash}",
    description: "Random hash string, 8 characters. A fresh value per row, quoted as 'a3f9c2d1'.",
  },
  {
    syntax: "{hash:16}",
    description: "Random hash string with the given length (1–128).",
  },
  {
    syntax: "{date:yyyy-mm-dd HH:MM:SS}",
    description: "Random date-time within the last 7 days, down to seconds. Quoted, fresh per row.",
  },
  {
    syntax: "{date:yyyy-mm-dd}",
    description: "Random date within the last 7 days (date only).",
  },
  {
    syntax: "{date:yyyy-mm}",
    description: "Random date within the last 7 days (year-month only).",
  },
] as const;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DATE_PATTERNS = new Set(["yyyy-mm-dd HH:MM:SS", "yyyy-mm-dd", "yyyy-mm"]);
const TOKEN_RE = /\{([A-Za-z]+)(?::([^}]*))?\}/g;

export interface BatchTemplate {
  /** Number of rows the template expands to (1 when no {seq} is present). */
  count: number;
  /** Renders the statement for row index i (0-based). hash/date are fresh per call. */
  render: (i: number) => string;
}

export type ParseResult =
  | { ok: true; template: BatchTemplate }
  | { ok: false; error: string };

function randomHash(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

function randomRecentDate(pattern: string): string {
  const d = new Date(Date.now() - Math.random() * WEEK_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  if (pattern === "yyyy-mm") return ym;
  const ymd = `${ym}-${pad(d.getDate())}`;
  if (pattern === "yyyy-mm-dd") return ymd;
  return `${ymd} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parseSeqRange(args: string): { from: number; to: number } | null {
  const full = /^from-(\d+)-to-(\d+)$/.exec(args);
  if (full) return { from: Number(full[1]), to: Number(full[2]) };
  const short = /^to-(\d+)$/.exec(args);
  if (short) return { from: 1, to: Number(short[1]) };
  return null;
}

function validateSeq(
  token: string,
  args: string
): { ok: true; length: number } | { ok: false; error: string } {
  const range = parseSeqRange(args);
  if (!range) {
    return {
      ok: false,
      error: `Invalid seq range: ${token} (use {seq:from-A-to-B} or {seq:to-B})`,
    };
  }
  if (range.from > range.to) {
    return { ok: false, error: `Invalid seq range: ${token} (from > to)` };
  }
  const length = range.to - range.from + 1;
  if (length > MAX_BATCH_ROWS) {
    return {
      ok: false,
      error: `Batch size ${length} exceeds the limit of ${MAX_BATCH_ROWS} rows.`,
    };
  }
  return { ok: true, length };
}

/** Returns an error message, or null when the token is valid. */
function validateHash(token: string, args: string): string | null {
  if (args !== "" && !/^\d+$/.test(args)) return `Invalid hash length: ${token}`;
  const length = args === "" ? 8 : Number(args);
  if (length < 1 || length > 128) return `Hash length must be 1–128: ${token}`;
  return null;
}

/** Returns an error message, or null when the token is valid. */
function validateDate(token: string, args: string): string | null {
  if (DATE_PATTERNS.has(args)) return null;
  return `Unsupported date pattern: ${token} (use yyyy-mm-dd HH:MM:SS, yyyy-mm-dd, or yyyy-mm)`;
}

export function parseBatchTemplate(sql: string): ParseResult {
  let count = 1;
  let firstSeqSeen = false;

  for (const match of sql.matchAll(TOKEN_RE)) {
    const [token, name, args = ""] = match;
    if (name === "seq") {
      const seq = validateSeq(token, args);
      if (!seq.ok) return seq;
      // The first {seq} determines the batch size
      if (!firstSeqSeen) {
        firstSeqSeen = true;
        count = seq.length;
      }
    } else if (name === "hash") {
      const error = validateHash(token, args);
      if (error) return { ok: false, error };
    } else if (name === "date") {
      const error = validateDate(token, args);
      if (error) return { ok: false, error };
    } else {
      return { ok: false, error: `Unknown placeholder: ${token}` };
    }
  }

  const render = (i: number) =>
    sql.replace(TOKEN_RE, (_token, name: string, args = "") => {
      if (name === "seq") {
        const range = parseSeqRange(args)!;
        return String(range.from + i);
      }
      if (name === "hash") {
        return `'${randomHash(args === "" ? 8 : Number(args))}'`;
      }
      return `'${randomRecentDate(args)}'`;
    });

  return { ok: true, template: { count, render } };
}
