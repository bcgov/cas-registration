import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    // @ts-expect-error
    secret: process.env.AUTH_SECRET,
  });
  return NextResponse.json(token, { status: 200 });
}
