import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// 🛠️ Function for federated logout, Single Sign-Out (SSO) from keycloak
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // Respond with error
    return NextResponse.json(
      { message: "Missing JWT token." },
      { status: 500 }
    );
  }
  const idToken = token.id_token;
  const keycloakLogoutUrl = process.env.KEYCLOAK_LOGOUT_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (!idToken || !keycloakLogoutUrl || !nextAuthUrl) {
    // Respond with error
    return NextResponse.json(
      { message: "Logout variables are not properly set" },
      { status: 500 }
    );
  }

  const url = `${keycloakLogoutUrl}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(
    nextAuthUrl
  )}`;

  try {
    // log out from Keycloak
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      //🚧 fixme status 404 Not Found
      console.error("Keycloak logout failed with status: " + response.status);
      console.log("--------------URL---------------");
      console.log(url);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }

  return new Response(null, {
    status: 200,
    statusText: "SUCCESS",
  });
}
