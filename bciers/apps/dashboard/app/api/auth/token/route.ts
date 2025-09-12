import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { shouldUseSecureCookies } from "@bciers/utils/src/environmentDetection";

const cookieName = shouldUseSecureCookies()
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: `${process.env.NEXTAUTH_SECRET}`,
    salt: cookieName,
    cookieName: cookieName,
  });
  return NextResponse.json(token, { status: 200 });
}
