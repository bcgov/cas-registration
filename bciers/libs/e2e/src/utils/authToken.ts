import { Page } from "@playwright/test";

export type AuthToken = Record<string, unknown> & {
  user_guid?: string;
};

/**
 * Fetches the NextAuth token from the app's own API route.
 * Uses the browser context (so it always includes storageState cookies).
 */
export async function getAuthTokenFromPage(page: Page): Promise<AuthToken> {
  const token = await page.evaluate(async () => {
    const res = await fetch("/api/auth/token", { method: "POST" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST /api/auth/token failed: ${res.status} ${text}`);
    }
    return res.json();
  });

  return token as AuthToken;
}

export async function getUserGuidFromPage(page: Page): Promise<string> {
  const token = await getAuthTokenFromPage(page);
  const userGuid = token.user_guid;

  if (!userGuid || typeof userGuid !== "string") {
    throw new Error(
      `Token missing user_guid. Token keys: ${Object.keys(token).join(", ")}`,
    );
  }

  return userGuid;
}
