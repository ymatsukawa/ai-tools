export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "HEAD";

export const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "HEAD",
];

export interface KeyValue {
  id: string;
  key: string;
  value: string;
}

export type BodyMode = "none" | "json" | "form";
export type JsonInputMode = "raw" | "file";
export type AuthMode = "none" | "basic" | "bearer";

export interface CurlOptions {
  followRedirects: boolean;
  insecure: boolean;
  verbose: boolean;
  silent: boolean;
  includeResponseHeaders: boolean;
  timeoutSeconds: string;
  outputFile: string;
  authMode: AuthMode;
  basicUser: string;
  basicPassword: string;
  bearerToken: string;
}

export interface CurlConfig {
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  bodyMode: BodyMode;
  jsonInputMode: JsonInputMode;
  jsonText: string;
  jsonFileName: string;
  formFields: KeyValue[];
  options: CurlOptions;
}

export const initialCurlConfig: CurlConfig = {
  method: "GET",
  url: "",
  headers: [{ id: "header-0", key: "", value: "" }],
  bodyMode: "none",
  jsonInputMode: "raw",
  jsonText: "",
  jsonFileName: "example.json",
  formFields: [{ id: "form-0", key: "", value: "" }],
  options: {
    followRedirects: false,
    insecure: false,
    verbose: false,
    silent: false,
    includeResponseHeaders: false,
    timeoutSeconds: "",
    outputFile: "",
    authMode: "none",
    basicUser: "",
    basicPassword: "",
    bearerToken: "",
  },
};

export function escapeShellArg(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

export function getUrlHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const LOCALHOST_NAMES = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"];

export function isLocalhostUrl(url: string): boolean {
  const host = getUrlHost(url);
  return host !== null && LOCALHOST_NAMES.includes(host);
}

export function generateCurlCommand(config: CurlConfig): string {
  const parts = [
    commandLine(config),
    ...headerArgs(config.headers),
    ...authArgs(config.options),
    ...bodyArgs(config),
    ...flagArgs(config.options),
  ];

  return parts.join(" \\\n  ");
}

function filledRows(rows: KeyValue[]): KeyValue[] {
  return rows.filter((row) => row.key.trim() !== "");
}

function hasContentTypeHeader(headers: KeyValue[]): boolean {
  return filledRows(headers).some(
    (h) => h.key.trim().toLowerCase() === "content-type",
  );
}

function commandLine(config: CurlConfig): string {
  const head = ["curl"];
  if (config.method === "HEAD") {
    head.push("-I");
  } else if (config.method !== "GET") {
    head.push("-X", config.method);
  }
  head.push(escapeShellArg(config.url.trim()));

  return head.join(" ");
}

function headerArgs(headers: KeyValue[]): string[] {
  return filledRows(headers).map(
    (h) => `-H ${escapeShellArg(`${h.key.trim()}: ${h.value}`)}`,
  );
}

function authArgs(options: CurlOptions): string[] {
  if (options.authMode === "basic") {
    return [
      `-u ${escapeShellArg(`${options.basicUser}:${options.basicPassword}`)}`,
    ];
  }
  if (options.authMode === "bearer" && options.bearerToken.trim()) {
    return [
      `-H ${escapeShellArg(`Authorization: Bearer ${options.bearerToken.trim()}`)}`,
    ];
  }
  return [];
}

function bodyArgs(config: CurlConfig): string[] {
  if (config.bodyMode === "json") {
    const args = hasContentTypeHeader(config.headers)
      ? []
      : [`-H 'Content-Type: application/json'`];
    if (config.jsonInputMode === "file") {
      const fileName = config.jsonFileName.trim() || "example.json";
      args.push(`-d ${escapeShellArg(`@${fileName}`)}`);
    } else {
      args.push(`-d ${escapeShellArg(config.jsonText)}`);
    }
    return args;
  }

  if (config.bodyMode === "form") {
    return filledRows(config.formFields).map(
      (field) =>
        `--data-urlencode ${escapeShellArg(`${field.key.trim()}=${field.value}`)}`,
    );
  }

  return [];
}

function flagArgs(options: CurlOptions): string[] {
  const args: string[] = [];
  if (options.followRedirects) args.push("-L");
  if (options.insecure) args.push("-k");
  if (options.verbose) args.push("-v");
  if (options.silent) args.push("-s");
  if (options.includeResponseHeaders) args.push("-i");

  const timeout = parseTimeoutSeconds(options.timeoutSeconds);
  if (timeout !== null) args.push(`--max-time ${timeout}`);
  if (options.outputFile.trim()) {
    args.push(`-o ${escapeShellArg(options.outputFile.trim())}`);
  }

  return args;
}

export function parseTimeoutSeconds(value: string): number | null {
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}
