import type { HttpClient, XeroResponse } from "./HttpClient.js";
import type { XeroToken } from "../auth/Token.js";
import { authHeader } from "../auth/Token.js";
import { parseJson } from "./HttpClient.js";
import { XeroError } from "../errors/index.js";

/** Builds the common Authorization/Content-Type/Accept headers used by every domain resource. */
export function buildHeaders(token: XeroToken, contentType?: string): Headers {
  const h = new Headers();
  h.set("Authorization", authHeader(token));
  if (contentType) h.set("Content-Type", contentType);
  h.set("Accept", "application/json");
  return h;
}

export interface RequestOptions {
  tenantId?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** Extra/overriding headers (e.g. If-Modified-Since, custom Accept). */
  headers?: HeadersInit;
}

function appendQuery(url: string, query?: URLSearchParams): string {
  if (!query || [...query.keys()].length === 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${query.toString()}`;
}

/**
 * Issues a GET and decodes the JSON response body as `T`.
 */
export async function getJson<T>(
  client: HttpClient,
  baseUrl: string,
  path: string,
  token: XeroToken,
  query?: URLSearchParams,
  options: RequestOptions = {},
): Promise<T> {
  const headers = mergeHeaders(buildHeaders(token), options.headers);
  const response = await client.request({
    method: "GET",
    url: appendQuery(baseUrl + path, query),
    headers,
    tenantId: options.tenantId,
    signal: options.signal,
  });
  return parseJson<T>(response) as T;
}

/**
 * Issues a request with a JSON body (POST/PUT/DELETE) and decodes the
 * JSON response as `T`. Pass `body: undefined` for a bodyless request.
 */
export async function sendJson<T>(
  client: HttpClient,
  baseUrl: string,
  method: string,
  path: string,
  token: XeroToken,
  body: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers = mergeHeaders(
    buildHeaders(token, body !== undefined ? "application/json" : undefined),
    options.headers,
  );
  const response = await client.request({
    method,
    url: baseUrl + path,
    headers,
    body: body !== undefined ? JSON.stringify(body) : null,
    tenantId: options.tenantId,
    idempotencyKey: options.idempotencyKey,
    signal: options.signal,
  });
  return parseJson<T>(response) as T;
}

/** Issues a request and returns the raw response body text (no JSON decoding). */
export async function requestRaw(
  client: HttpClient,
  baseUrl: string,
  method: string,
  path: string,
  token: XeroToken,
  options: RequestOptions & {
    query?: URLSearchParams;
    body?: BodyInit | null;
    contentType?: string;
  } = {},
): Promise<XeroResponse> {
  const headers = mergeHeaders(buildHeaders(token, options.contentType), options.headers);
  return client.request({
    method,
    url: appendQuery(baseUrl + path, options.query),
    headers,
    body: options.body ?? null,
    tenantId: options.tenantId,
    idempotencyKey: options.idempotencyKey,
    signal: options.signal,
  });
}

function mergeHeaders(base: Headers, extra?: HeadersInit): Headers {
  if (!extra) return base;
  const h = new Headers(base);
  new Headers(extra).forEach((value, key) => h.set(key, value));
  return h;
}

/** Throws a config error if `value` is falsy — used to guard required path parameters. */
export function requireValue(value: string | undefined | null, name: string): string {
  if (!value) throw XeroError.configError(`${name} is required`);
  return value;
}
