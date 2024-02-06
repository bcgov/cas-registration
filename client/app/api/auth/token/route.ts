import { mockToken } from "@/mock/mocksession";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return NextResponse.json(process.env.BYPASS ? mockToken : token, { status: 200 });
}
