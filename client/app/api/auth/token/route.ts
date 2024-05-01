import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    // @ts-expect-error
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: false,
  });
  return NextResponse.json(token, { status: 200 });
}
