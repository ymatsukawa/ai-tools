import { parseTimeoutSeconds, type CurlConfig } from "./curl";

export interface TestResult {
  ok: boolean;
  status?: number;
  statusText?: string;
  durationMs?: number;
  bodySnippet?: string;
  error?: string;
  note?: string;
  /** Request line and headers sent, when -v is enabled */
  requestLog?: string;
  /** Response headers, when -v or -i is enabled */
  responseHeaders?: string;
}

const BODY_SNIPPET_LIMIT = 1000;
const DEFAULT_TIMEOUT_MS = 10_000;

export async function executeTestRequest(
  config: CurlConfig,
): Promise<TestResult> {
  const headers = buildRequestHeaders(config);
  const { body, note } = buildRequestBody(config, headers);
  const timeoutMs = resolveTimeoutMs(config);
  const requestLog = config.options.verbose
    ? formatRequestLog(config, headers)
    : undefined;

  const start = Date.now();
  try {
    const response = await fetch(config.url.trim(), {
      method: config.method,
      headers,
      body,
      redirect: config.options.followRedirects ? "follow" : "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });

    return {
      ok: response.status < 400,
      status: response.status,
      statusText: response.statusText,
      durationMs: Date.now() - start,
      bodySnippet: await readBodySnippet(response, config),
      note,
      requestLog,
      responseHeaders: formatResponseHeaders(response, config),
    };
  } catch (error) {
    return {
      ok: false,
      durationMs: Date.now() - start,
      error: describeFetchError(error, timeoutMs),
      note,
      requestLog,
    };
  }
}

function buildRequestHeaders(config: CurlConfig): Headers {
  const headers = new Headers();
  for (const h of config.headers) {
    if (h.key.trim() !== "") {
      headers.set(h.key.trim(), h.value);
    }
  }

  const { options } = config;
  if (options.authMode === "basic") {
    const credentials = `${options.basicUser}:${options.basicPassword}`;
    headers.set(
      "Authorization",
      `Basic ${Buffer.from(credentials).toString("base64")}`,
    );
  } else if (options.authMode === "bearer" && options.bearerToken.trim()) {
    headers.set("Authorization", `Bearer ${options.bearerToken.trim()}`);
  }

  return headers;
}

function buildRequestBody(
  config: CurlConfig,
  headers: Headers,
): { body?: string; note?: string } {
  if (config.bodyMode === "none") return {};

  const canHaveBody = config.method !== "GET" && config.method !== "HEAD";
  if (!canHaveBody) {
    return { note: `Body was not sent (${config.method} request)` };
  }

  if (config.bodyMode === "form") {
    const params = new URLSearchParams();
    for (const field of config.formFields) {
      if (field.key.trim() !== "") {
        params.append(field.key.trim(), field.value);
      }
    }
    setDefaultContentType(headers, "application/x-www-form-urlencoded");
    return { body: params.toString() };
  }

  if (config.jsonInputMode === "file") {
    return { note: "Body was not sent (file mode references a local file)" };
  }

  setDefaultContentType(headers, "application/json");
  return { body: config.jsonText };
}

function setDefaultContentType(headers: Headers, contentType: string): void {
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", contentType);
  }
}

function resolveTimeoutMs(config: CurlConfig): number {
  const seconds = parseTimeoutSeconds(config.options.timeoutSeconds);
  return seconds !== null ? seconds * 1000 : DEFAULT_TIMEOUT_MS;
}

function formatRequestLog(config: CurlConfig, headers: Headers): string {
  const lines = [`> ${config.method} ${config.url.trim()}`];
  for (const [key, value] of headers.entries()) {
    lines.push(`> ${key}: ${value}`);
  }
  return lines.join("\n");
}

function formatResponseHeaders(
  response: Response,
  config: CurlConfig,
): string | undefined {
  const { verbose, includeResponseHeaders } = config.options;
  if (!verbose && !includeResponseHeaders) return undefined;

  const lines = [`< HTTP ${response.status} ${response.statusText}`.trim()];
  for (const [key, value] of response.headers.entries()) {
    lines.push(`< ${key}: ${value}`);
  }
  return lines.join("\n");
}

async function readBodySnippet(
  response: Response,
  config: CurlConfig,
): Promise<string | undefined> {
  if (config.method === "HEAD") return undefined;

  const text = await response.text();
  return text.length > BODY_SNIPPET_LIMIT
    ? `${text.slice(0, BODY_SNIPPET_LIMIT)}…`
    : text;
}

function describeFetchError(error: unknown, timeoutMs: number): string {
  if (error instanceof Error && error.name === "TimeoutError") {
    return `Timed out after ${timeoutMs / 1000}s`;
  }
  return error instanceof Error ? error.message : String(error);
}
