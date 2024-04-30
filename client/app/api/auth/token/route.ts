import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Ensure process.env.NEXTAUTH_SECRET is defined
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is not defined.");
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    salt: "salt", // Add salt here
  });
  return NextResponse.json(token, { status: 200 });
}
