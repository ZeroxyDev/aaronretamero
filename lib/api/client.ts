export class ApiClientError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(options: {
    code: string;
    details?: unknown;
    message: string;
    status: number;
  }) {
    super(options.message);
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

type JsonValue =
  | boolean
  | null
  | number
  | string
  | JsonValue[]
  | {[key: string]: JsonValue};

type JsonRequestInit = Omit<RequestInit, "body"> & {
  body?: JsonValue;
};

function resolvePathnameHeader(input: RequestInfo | URL) {
  if (typeof window !== "undefined") {
    return window.location.pathname || null;
  }

  if (typeof input === "string" && input.startsWith("/")) {
    return input.split("?")[0] || null;
  }

  if (input instanceof URL) {
    return input.pathname || null;
  }

  return null;
}

async function request<TResponse>(
  input: RequestInfo | URL,
  init?: JsonRequestInit,
) {
  const pathname = resolvePathnameHeader(input);
  const response = await fetch(input, {
    ...init,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    headers: {
      "content-type": "application/json",
      ...(pathname ? {"x-pathname": pathname} : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: {
            code?: string;
            details?: unknown;
            message?: string;
          };
        }
      | null;

    throw new ApiClientError({
      code: payload?.error?.code ?? "request_failed",
      details: payload?.error?.details,
      message: payload?.error?.message ?? "Request failed.",
      status: response.status,
    });
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  request,
  get: <TResponse>(input: RequestInfo | URL, init?: Omit<JsonRequestInit, "method">) =>
    request<TResponse>(input, {
      ...init,
      method: "GET",
    }),
  post: <TResponse>(
    input: RequestInfo | URL,
    body?: JsonValue,
    init?: Omit<JsonRequestInit, "body" | "method">,
  ) =>
    request<TResponse>(input, {
      ...init,
      method: "POST",
      body,
    }),
};
