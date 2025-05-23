"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import {
  SessionProvider as NextAuthProvider,
  __NEXTAUTH,
  getSession,
  signOut,
  useSession,
} from "next-auth/react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

/*
📚 NextAuth provider:
Import NextAuth.js SessionProvider as a client component because it uses context.
Then export this client SessionProvider to be used in your server component
(e.g. in app/layout.tsx). 
This enables sharing session state as context throughout the application, 
plus our expiry warning dialog.
*/

const REFRESH_KEY = "nextauth:session-refreshed";
const NOW = () => Date.now();
const SIGN_OUT_OPTS = { callbackUrl: "/onboarding" };

function ExpiryWarning() {
  const { status } = useSession();
  const [session, setSession] = useState(__NEXTAUTH._session);
  const [show, setShow] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const warnTimer = useRef<number>();
  const logoutTimer = useRef<number>();
  const tickTimer = useRef<number>();

  // 1) Override internal fetcher & listen for cross-tab broadcasts
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_KEY) {
        console.log(
          "[ExpiryWarning] Received refresh broadcast → hiding dialog",
        );
        setShow(false);
        clearTimeout(warnTimer.current);
        clearTimeout(logoutTimer.current);
        clearInterval(tickTimer.current);
        __NEXTAUTH._getSession({ event: "storage" });
      }
    };

    __NEXTAUTH._getSession = async ({ event } = {}) => {
      console.log(`[ExpiryWarning] _getSession called, event=${event}`);
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
      console.log(
        "[ExpiryWarning] New expires =",
        __NEXTAUTH._session?.expires,
      );
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

  // 2) Schedule warning & logout whenever session.expires changes
  useEffect(() => {
    console.log(
      "[ExpiryWarning] scheduling with new expires:",
      session?.expires,
    );

    // Hide and clear old timers on any expiration update
    setShow(false);
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(tickTimer.current);

    if (status !== "authenticated" || !session?.expires) {
      console.log("[ExpiryWarning] not authenticated or no expiry → skipping");
      return;
    }

    const msLeft = new Date(session.expires).getTime() - NOW();
    const warnMs = 5 * 60 * 1000;
    console.log(`[ExpiryWarning] msLeft=${msLeft}, warnMs=${warnMs}`);

    if (msLeft <= 0) {
      console.log("[ExpiryWarning] already expired → signing out");
      signOut(SIGN_OUT_OPTS);
      return;
    }

    if (msLeft <= warnMs) {
      console.log("[ExpiryWarning] within warning window → showing dialog");
      setShow(true);
      setSeconds(Math.ceil(msLeft / 1000));
    } else {
      console.log(`[ExpiryWarning] will show dialog in ${msLeft - warnMs}ms`);
      warnTimer.current = window.setTimeout(() => {
        console.log("[ExpiryWarning] warning timeout fired → show dialog");
        setShow(true);
        setSeconds(Math.ceil(warnMs / 1000));
      }, msLeft - warnMs);
    }

    logoutTimer.current = window.setTimeout(() => {
      console.log("[ExpiryWarning] logout timeout fired → signing out");
      signOut(SIGN_OUT_OPTS);
    }, msLeft);

    return () => {
      clearTimeout(warnTimer.current);
      clearTimeout(logoutTimer.current);
    };
  }, [status, session?.expires]);

  // 3) Once shown, tick down and auto-logout at zero
  useEffect(() => {
    if (!show) return;
    console.log("[ExpiryWarning] starting countdown");
    tickTimer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          console.log("[ExpiryWarning] countdown ended → signing out");
          clearInterval(tickTimer.current);
          signOut(SIGN_OUT_OPTS);
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

  const formatMMSS = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Stay signed in → refresh + broadcast
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
          <Button onClick={() => signOut(SIGN_OUT_OPTS)}>Log Out</Button>
          <Button variant="contained" onClick={extend}>
            Stay Logged In
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

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
