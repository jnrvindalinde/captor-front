// Server-only Laravel API client.
// Token is fetched from the session cookie when calling protected endpoints.
import "server-only";
import { getSessionToken } from "@/lib/session";

const BASE_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

type ApiOptions = RequestInit & {
  /** Skip attaching the session bearer token. */
  anonymous?: boolean;
  /** Parsed-and-returned JSON body. */
  json?: unknown;
};

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const { anonymous, json, headers, body, ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  let finalBody: BodyInit | undefined = body as BodyInit | undefined;
  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(json);
  }

  if (!anonymous) {
    const token = await getSessionToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
    cache: "no-store",
  });

  if (!res.ok) {
    let payload: { message?: string; errors?: Record<string, string[]> } = {};
    try {
      payload = await res.json();
    } catch {
      /* non-JSON error */
    }
    const err: ApiError = {
      status: res.status,
      message: payload.message ?? res.statusText,
      errors: payload.errors,
    };
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
