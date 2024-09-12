import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const isLocalDevelopment = process.env?.NEXTAUTH_URL?.includes(
  "http://localhost:3000",
);

const cookieName = isLocalDevelopment
  ? "authjs.session-token"
  : "__Secure-authjs.session-token";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: `${process.env.NEXTAUTH_SECRET}`,
    salt: cookieName,
    cookieName: cookieName,
  });
  return NextResponse.json(token, { status: 200 });
}
