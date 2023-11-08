import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

<<<<<<< HEAD
<<<<<<< HEAD
// 🛠️ Function for federated logout: Single Sign-Out (SSO) from keycloak
// https://www.keycloak.org/docs/latest/securing_apps/index.html#logout
export async function GET(request: NextRequest) {
  // Basic Logout
  let url = `${process.env.KEYCLOAK_LOGOUT_URL}`;

  // Include parameters id_token_hint, post_logout_redirect_uri so that logout does not need to be explicitly confirmed by the user
=======
// 🛠️ Function for federated logout, Single Sign-Out (SSO) from keycloak
export async function GET(request: NextRequest) {
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
// 🛠️ Function for federated logout: Single Sign-Out (SSO) from keycloak
// https://www.keycloak.org/docs/latest/securing_apps/index.html#logout
export async function GET(request: NextRequest) {
  // Basic Logout
  let url = `${process.env.KEYCLOAK_LOGOUT_URL}`;

  // Include parameters id_token_hint, post_logout_redirect_uri so that logout does not need to be explicitly confirmed by the user
>>>>>>> 42b636c (🚧 nextauth SSO)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 42b636c (🚧 nextauth SSO)
  if (token) {
    // set parameters
    url =
      url +
      `?id_token_hint=${
        token.id_token
      }&post_logout_redirect_uri=${encodeURIComponent(
        process.env.NEXTAUTH_URL as string
      )}`;
  } else {
<<<<<<< HEAD
<<<<<<< HEAD
    // Respond with error
    return NextResponse.json(
      { message: "Missing JWT token." },
      { status: 500 },
    );
  }
  try {
    // log out from Keycloak
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json(
        { message: "Keycloak logout error" },
        { status: 500 },
      );
    } else {
      return NextResponse.json({ message: "Success" }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
=======

  if (!token) {
=======
>>>>>>> 6734a9f (🦨 fix: code smell)
    // Respond with error
    return NextResponse.json(
      { message: "Missing JWT token." },
      { status: 500 }
    );
<<<<<<< HEAD
=======
    if (!token) {
      // Respond with error
      return NextResponse.json(
        { message: "Missing JWT token." },
        { status: 500 },
      );
    }
>>>>>>> 42b636c (🚧 nextauth SSO)
=======
>>>>>>> 6734a9f (🦨 fix: code smell)
  }
  try {
    // log out from Keycloak
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json(
        { message: "Keycloak logout error" },
        { status: 500 }
      );
    } else {
      return NextResponse.json({ message: "Success" }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
<<<<<<< HEAD

<<<<<<< HEAD
  return new Response(null, {
    status: 200,
    statusText: "SUCCESS",
  });
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
  return NextResponse.json({ message: "Success" }, { status: 200 });
>>>>>>> 42b636c (🚧 nextauth SSO)
=======
>>>>>>> 6734a9f (🦨 fix: code smell)
}
