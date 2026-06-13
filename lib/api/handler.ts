import {NextResponse} from "next/server";

export class ApiRouteError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(options: {
    code: string;
    message: string;
    details?: unknown;
    status: number;
  }) {
    super(options.message);
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

type ApiHandlerContext<TParams = unknown> = {
  params: TParams;
  request: Request;
};

type ApiHandler<TParams = unknown> = (
  context: ApiHandlerContext<TParams>,
) => Promise<Response>;

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function withApiHandler<TParams = unknown>(
  handler: ApiHandler<TParams>,
) {
  return async (
    request: Request,
    context: {params: Promise<TParams>} | {params: TParams},
  ) => {
    try {
      const params = await Promise.resolve(context.params);

      return await handler({
        params,
        request,
      });
    } catch (error) {
      if (error instanceof ApiRouteError) {
        return jsonResponse(
          {
            error: {
              code: error.code,
              details: error.details ?? null,
              message: error.message,
            },
          },
          {status: error.status},
        );
      }

      console.error("Unhandled API route error.", error);

      return jsonResponse(
        {
          error: {
            code: "internal_error",
            details: null,
            message: "Internal server error.",
          },
        },
        {status: 500},
      );
    }
  };
}
