import { NextResponse } from "next/server";

/*
API route that facilitates federated logout, performing Single Sign-Out (SSO) from SiteMinder and Keycloak. 
 https://www.keycloak.org/docs/latest/securing_apps/index.html#logout
 https://stackoverflow.developer.gov.bc.ca/a/84/262
 */
export async function GET() {
  try {
    // Keycloak Logout Url
    const keycloakLogoutUrl = process.env.KEYCLOAK_LOGOUT_URL + "X";
    // SiteMinder Logout Url returl to initiate Keycloak Logout
    const siteminderLogoutUrl = `${process.env.SITEMINDER_LOGOUT_URL}?retnow=1&returl=${keycloakLogoutUrl}`;

    // Attempt Single Sign-Out (SSO) from SiteMinder and Keycloak...
    const response = await fetch(siteminderLogoutUrl, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json({ message: "Logout error" }, { status: 500 });
    } else {
      return NextResponse.json({ message: "Success" }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
