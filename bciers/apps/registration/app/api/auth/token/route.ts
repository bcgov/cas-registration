// eslint-disable-next-line import/no-extraneous-dependencies
import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // @ts-expect-error
  const token = await getToken({
    req: request,
    secret: `${process.env.NEXTAUTH_SECRET}`,
  });
  return NextResponse.json(token, { status: 200 });
}
