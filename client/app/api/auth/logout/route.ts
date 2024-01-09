import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// 🛠️ Function for federated logout: Single Sign-Out (SSO) from keycloak
// https://www.keycloak.org/docs/latest/securing_apps/index.html#logout
export async function GET(request: NextRequest) {
  // Chained logout of SiteMinder and Keycloak, per https://stackoverflow.developer.gov.bc.ca/a/84/262
  let siteminderUrl = `${process.env.SITEMINDER_LOGOUT_URL}`;
  // Keycloak Logout
  let keycloakUrl = `${process.env.KEYCLOAK_LOGOUT_URL}`;

  // Include parameters post_logout_redirect_uri so that logout does not need to be explicitly confirmed by the user
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (token) {
    // set parameters
    keycloakUrl =
      keycloakUrl +
      `post_logout_redirect_uri=${encodeURIComponent(
        process.env.NEXTAUTH_URL as string,
      )}`;
  } else {
    // Respond with error
    return NextResponse.json(
      { message: "Missing JWT token." },
      { status: 500 },
    );
  }
  try {
    const url = `${siteminderUrl}?retnow=1&returl=${keycloakUrl}`;
    // log out from Keycloak
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json({ message: "Logout error" }, { status: 500 });
    } else {
      return NextResponse.json({ message: "Success" }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
