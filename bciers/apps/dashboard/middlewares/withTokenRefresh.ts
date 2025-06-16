import { NextRequest, NextResponse } from "next/server";
import { encode, getToken } from "next-auth/jwt";
import { MiddlewareFactory } from "@bciers/middlewares";
import { JWT } from "next-auth";
import { OAUTH_TOKEN_ROTATION_INTERVAL_SECONDS } from "../auth/auth.config";

export const SESSION_SECURE = process.env.AUTH_URL?.startsWith("https://");
export const SESSION_COOKIE = SESSION_SECURE
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

function shouldUpdateToken(token: JWT | null) {
  /***
   * Checks whether our refresh interval has expired
   */
  return Date.now() / 1000 > (token?.expires_at ?? 0);
}

async function fetchNewAccessToken(refreshToken: string | undefined) {
  console.log("Feching new tokens...");
  /**
   * Attempt to refresh access token from the OAuth provider
   */
  const newTokensResponse = await fetch(`${process.env.KEYCLOAK_TOKEN_URL}`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: `${process.env.KEYCLOAK_CLIENT_ID}`,
      client_secret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
      grant_type: "refresh_token",
      refresh_token: `${refreshToken}`,
    }),
  });

  if (!newTokensResponse.ok)
    throw new Error("Error refreshing KeyCloak access token");

  const newTokens = await newTokensResponse.json();

  console.log(
    "New expiry:    : ",
    Math.round(Date.now() / 1000) + OAUTH_TOKEN_ROTATION_INTERVAL_SECONDS,
  );

  return {
    access_token: newTokens.access_token,
    refresh_token: newTokens.refresh_token,
    expires_at:
      Math.round(Date.now() / 1000) + OAUTH_TOKEN_ROTATION_INTERVAL_SECONDS,
  };
}

export const withTokenRefreshMiddleware: MiddlewareFactory = () => {
  /**
   * Middleware that supplements next-auth to add access token rotation.
   * Huge thanks to the community: https://github.com/nextauthjs/next-auth/discussions/9715#discussioncomment-12818495
   */
  return async (request: NextRequest) => {
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log("Middleware called.");
    // Casting to our augmented JWT type
    const jwt = (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;

    console.log("Now           : ", Date.now() / 1000);
    console.log("JWT expires at: ", jwt?.expires_at);
    console.log("Difference    : ", Date.now() / 1000 - (jwt?.expires_at ?? 0));

    const response = NextResponse.next();

    if (!jwt) return response;

    if (shouldUpdateToken(jwt)) {
      const newKcTokens = await fetchNewAccessToken(jwt.refresh_token);

      const newSessionToken = await encode({
        secret: `${process.env.NEXTAUTH_SECRET}`,
        token: {
          ...jwt,
          ...newKcTokens,
        },
        maxAge: 30 * 60, // 30 min to match KC
        salt: SESSION_COOKIE,
      });

      const size = 3933; // maximum size of each chunk
      const regex = new RegExp(`.{1,${size}}`, "g");

      // split the string into an array of strings
      const tokenChunks = newSessionToken.match(regex);

      if (tokenChunks) {
        tokenChunks.forEach((tokenChunk, index) => {
          response.cookies.set(`${SESSION_COOKIE}.${index}`, tokenChunk, {
            httpOnly: true,
            maxAge: 30 * 60, // 30 min to match KC
            secure: SESSION_SECURE,
            sameSite: "lax",
          });
        });
      }
    }

    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

    return response;
  };
};
