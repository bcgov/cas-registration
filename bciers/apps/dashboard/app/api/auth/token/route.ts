import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";
const isCIBuild = process.env.CI === "true";

const cookieName =
  isProduction && !isCIBuild
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: `${process.env.NEXTAUTH_SECRET}`,
    salt: cookieName,
    cookieName: cookieName,
  });
  return NextResponse.json(token, { status: 200 });
}
