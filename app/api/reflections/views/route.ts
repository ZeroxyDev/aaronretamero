import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {siteConfig} from "@/config/site";
import {ApiRouteError, jsonResponse, withApiHandler} from "@/lib/api/handler";
import {domainActions} from "@/lib/db/domain-actions";

type ReflectionViewRequestBody = {
  entryId?: string;
};

const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isValidReflectionViewBody(
  value: unknown,
): value is Required<Pick<ReflectionViewRequestBody, "entryId">> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as ReflectionViewRequestBody;
  return typeof candidate.entryId === "string";
}

export const POST = withApiHandler(async ({ request }) => {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!isValidReflectionViewBody(body)) {
    throw new ApiRouteError({
      code: "invalid_payload",
      message: "Invalid reflection view payload.",
      status: 400,
    });
  }

  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(siteConfig.cookies.visitorIdName)?.value;
  const visitorId = existingVisitorId ?? crypto.randomUUID();
  const result = await domainActions.reflectionView.recordView(body.entryId, visitorId);
  const response = jsonResponse(
    {
      data: {
        entryId: body.entryId,
        isNew: result?.isNew ?? null,
        views: result?.views ?? null,
      },
    },
    {status: 202},
  ) as NextResponse;

  if (!existingVisitorId) {
    response.cookies.set({
      name: siteConfig.cookies.visitorIdName,
      value: visitorId,
      httpOnly: true,
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
});
