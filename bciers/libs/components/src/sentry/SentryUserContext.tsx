"use client";

import { useEffect } from "react";
import { getToken } from "@bciers/actions";
import * as Sentry from "@sentry/nextjs";

/**
 * Component that automatically sets user context in Sentry when token is available.
 */
export default function SentryUserContext() {
  useEffect(() => {
    const setUserContext = async () => {
      try {
        const token = await getToken();
        if (token?.user_guid) {
          Sentry.setUser({ id: token.user_guid });
        } else {
          // Clear user context if no token
          Sentry.setUser(null);
        }
      } catch {
        // Silently fail if token fetch fails
      }
    };

    setUserContext();

    // Update user context periodically in case token changes
    const interval = setInterval(setUserContext, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}
