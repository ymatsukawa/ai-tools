/**
 * Plain-fetch JSON POST for hooks that loop over many sequential requests
 * (table scan, batch run). useFetcher is unsuitable there because it has
 * no awaitable per-call promise. `onFetchError` maps a network failure to
 * the caller's error-response shape.
 */
export async function postJson<TResponse>(
  url: string,
  payload: unknown,
  onFetchError: (message: string) => TResponse
): Promise<TResponse> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await response.json()) as TResponse;
  } catch (err) {
    return onFetchError(err instanceof Error ? err.message : String(err));
  }
}
