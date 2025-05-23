// client/SessionProvider.tsx
"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import {
  SessionProvider as NextAuthProvider,
  __NEXTAUTH,
  getSession,
  signOut,
  useSession,
} from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import { getEnvValue } from "@bciers/actions";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

/**
 * Client-side SessionProvider wrapper that:
 * - Uses NextAuth’s SessionProvider for auth context
 * - Injects a synchronized “session expiring soon” dialog
 * - Broadcasts and listens for token-refresh events across tabs
 */
export default function SessionProvider({
  children,
  session,
  basePath,
}: {
  children: ReactNode;
  session?: any;
  basePath?: string;
}) {
  return (
    <NextAuthProvider basePath={basePath} session={session}>
      {children}
      <ExpiryWarning />
    </NextAuthProvider>
  );
}

/** Key for cross-tab session-refresh broadcasts */
const REFRESH_KEY = "nextauth:session-refreshed";
/** Return the current timestamp in milliseconds */
const NOW = () => Date.now();

/**
 * Fetch the logout redirect URL from environment; report errors to Sentry.
 */
const getLogoutUrl = async () => {
  const logoutUrl = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
  if (!logoutUrl) {
    Sentry.captureException("Failed to fetch logout URL");
    console.error("Failed to fetch logout URL");
  }
  return logoutUrl;
};

/**
 * Handle logout by retrieving the SSO logout URL and calling NextAuth’s signOut.
 */
const handleLogout = async () => {
  const logoutUrl = await getLogoutUrl();
  await signOut({ redirectTo: logoutUrl || "/" });
};

/**
 * Displays a “Session Expiring Soon” modal 5 minutes before token expiry.
 * - Overrides __NEXTAUTH._getSession to cache and broadcast new expires
 * - Schedules warning & logout timers based on session.expires
 * - Syncs timer resets across tabs via localStorage
 */
function ExpiryWarning() {
  const { status } = useSession();
  const [session, setSession] = useState(__NEXTAUTH._session);
  const [show, setShow] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const warnTimer = useRef<number>();
  const logoutTimer = useRef<number>();
  const tickTimer = useRef<number>();
  // Track the last seen expires so we only broadcast on real changes
  const prevExpires = useRef<string | undefined>(__NEXTAUTH._session?.expires);

  // 1) Override internal session fetcher & listen for cross-tab broadcasts
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_KEY) {
        console.log("[ExpiryWarning] Refresh broadcast → reset timers");
        setShow(false);
        clearTimeout(warnTimer.current);
        clearTimeout(logoutTimer.current);
        clearInterval(tickTimer.current);

        // re-sync session, then compute & log next warning time
        __NEXTAUTH._getSession({ event: "storage" }).then(() => {
          const newExpires = __NEXTAUTH._session?.expires;
          if (!newExpires) return;
          const expiresMs = new Date(newExpires).getTime();
          const msLeft = expiresMs - NOW();
          const warnMs = 5 * 60 * 1000;
          if (msLeft > warnMs) {
            const warnAt = new Date(NOW() + msLeft - warnMs).toISOString();
            console.log(`[ExpiryWarning] Next dialog will show at ${warnAt}`);
          } else {
            console.log("[ExpiryWarning] Next dialog will show immediately");
          }
        });
      }
    };

    __NEXTAUTH._getSession = async ({ event } = {}) => {
      console.log(`[ExpiryWarning] _getSession called (event=${event})`);
      const isStorage = event === "storage";

      if (isStorage || __NEXTAUTH._session === undefined) {
        __NEXTAUTH._lastSync = NOW();
        __NEXTAUTH._session = await getSession({ broadcast: !isStorage });
      } else if (
        event &&
        __NEXTAUTH._session !== null &&
        NOW() >= (__NEXTAUTH._lastSync ?? 0)
      ) {
        __NEXTAUTH._lastSync = NOW();
        __NEXTAUTH._session = await getSession();
      }

      const newExpires = __NEXTAUTH._session?.expires;
      console.log("[ExpiryWarning] New expires =", newExpires);

      // Broadcast if expires truly changed (not from storage sync)
      if (!isStorage && newExpires && newExpires !== prevExpires.current) {
        prevExpires.current = newExpires;
        console.log("[ExpiryWarning] Broadcasting new expires:", newExpires);
        localStorage.setItem(REFRESH_KEY, NOW().toString());
        localStorage.removeItem(REFRESH_KEY);
      }

      setSession(__NEXTAUTH._session);
    };

    window.addEventListener("storage", onStorage);
    __NEXTAUTH._getSession(); // initial fetch

    return () => {
      window.removeEventListener("storage", onStorage);
      __NEXTAUTH._getSession = () => {};
      __NEXTAUTH._session = undefined;
      __NEXTAUTH._lastSync = 0;
    };
  }, []);

  // 2) Schedule warning & actual logout whenever session.expires changes
  useEffect(() => {
    console.log("[ExpiryWarning] scheduling for expires:", session?.expires);

    // Hide any existing dialog & clear timers
    setShow(false);
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(tickTimer.current);

    if (status !== "authenticated" || !session?.expires) {
      console.log("[ExpiryWarning] skipping – not authenticated or no expiry");
      return;
    }

    const expiresMs = new Date(session.expires).getTime();
    const msLeft = expiresMs - NOW();
    const warnMs = 5 * 60 * 1000; // 5 minutes
    if (msLeft <= 0) {
      console.log("[ExpiryWarning] session expired → logging out");
      handleLogout();
      return;
    }

    if (msLeft <= warnMs) {
      console.log("[ExpiryWarning] within warning window → showing dialog");
      setShow(true);
      setSeconds(Math.ceil(msLeft / 1000));
    } else {
      const delay = msLeft - warnMs;
      const warnAt = new Date(NOW() + delay).toISOString();
      console.log(`[ExpiryWarning] will show dialog at ${warnAt}`);
      warnTimer.current = window.setTimeout(() => {
        console.log("[ExpiryWarning] warning timeout fired → show dialog");
        setShow(true);
        setSeconds(Math.ceil(warnMs / 1000));
      }, delay);
    }

    // Schedule the actual logout at expiry
    logoutTimer.current = window.setTimeout(() => {
      console.log("[ExpiryWarning] logout timeout fired → logging out");
      handleLogout();
    }, msLeft);

    return () => {
      clearTimeout(warnTimer.current);
      clearTimeout(logoutTimer.current);
    };
  }, [status, session?.expires]);

  // 3) Once dialog is shown, tick down every second and auto-logout at zero
  useEffect(() => {
    if (!show) return;
    console.log("[ExpiryWarning] starting countdown");
    tickTimer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          console.log("[ExpiryWarning] countdown ended → logging out");
          clearInterval(tickTimer.current);
          handleLogout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      clearInterval(tickTimer.current);
      console.log("[ExpiryWarning] cleared countdown");
    };
  }, [show]);

  // Helper to format seconds as MM:SS
  const formatMMSS = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Extend session: hide dialog, refresh session, broadcast to other tabs
  const extend = async () => {
    console.log("[ExpiryWarning] Stay Signed In clicked");
    setShow(false);
    await __NEXTAUTH._getSession();
    console.log("[ExpiryWarning] broadcasting refresh");
    localStorage.setItem(REFRESH_KEY, NOW().toString());
    localStorage.removeItem(REFRESH_KEY);
  };

  if (status !== "authenticated") return null;

  return (
    <Dialog open={show} aria-labelledby="session-expiring" maxWidth="xs">
      <DialogTitle id="session-expiring">Session Expiring Soon</DialogTitle>
      <DialogContent>
        <Typography>
          You’ll be logged out in{" "}
          <Typography component="span" fontWeight="bold">
            {formatMMSS(seconds)}
          </Typography>
        </Typography>
        <Box mt={2} display="flex" gap={1}>
          <Button onClick={() => handleLogout()}>Log Out</Button>
          <Button variant="contained" onClick={extend}>
            Stay Signed In
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
