"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";

/**
 * Component that sets Sentry user context based on the NextAuth session.
 * This should be placed inside the SessionProvider to have access to the session.
 */
export default function SentryUserContext() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.user_guid || undefined,
        email: session.user.email || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  return null;
}
