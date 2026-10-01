import { config } from "./config";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      title?: string;
      errors?: Record<string, string[]>;
    } | null;
    const details = body?.errors
      ? Object.values(body.errors).flat().join(" ")
      : body?.title;
    throw new ApiError(
      response.status,
      details ||
        `Request failed (${response.status}). Check that the API and PostgreSQL are running.`,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
