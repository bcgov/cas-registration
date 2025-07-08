import { augmentJwt } from "@/dashboard/auth/augmentJwt";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: Request) {
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updatedToken = await augmentJwt(token, undefined, undefined, "update");

  return NextResponse.json({ ok: true, token: updatedToken });
}
