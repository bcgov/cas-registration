import { NextRequest } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";

export const domain = "https://localhost:3000";

export function mockRequest(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${domain}${path}`),
    url: domain,
  } as unknown as NextRequest;
}
