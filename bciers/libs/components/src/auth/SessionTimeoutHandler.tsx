"use client";

import React, { useEffect, useState } from "react";
import LogoutWarningModal from "@bciers/components/auth/LogoutWarningModal";
import { getEnvValue, getToken } from "@bciers/actions";
import { Session } from "next-auth";
import * as Sentry from "@sentry/nextjs";
import { signOut, useSession } from "next-auth/react";
import { BroadcastChannel } from "broadcast-channel";

export const ACTIVITY_THROTTLE_SECONDS = 15; // Throttle user activity checks (4 minutes)
export const MODAL_DISPLAY_SECONDS = 20; // Seconds before timeout to show logout warning modal (5 minutes)

const logoutChannel = new BroadcastChannel("logout");

const getExpirationTimeInSeconds = (expires: string | undefined): number => {
  if (!expires) return Infinity; // No expiration set, return infinite timeout
  return Math.max(0, (new Date(expires).getTime() - Date.now()) / 1000);
};

const SessionTimeoutHandler: React.FC = () => {
  const { data: session, status, update } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<number>(
    getExpirationTimeInSeconds(session?.expires),
  );

  const handleLogout = async () => {
    const logoutUrl = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
    if (!logoutUrl) {
      Sentry.captureException("Failed to fetch logout URL");
      console.error("Failed to fetch logout URL");
    }

    // Broadcast logout event to all tabs
    logoutChannel.postMessage("logout");

    await signOut({ redirectTo: logoutUrl || "/" });
  };

  // Refreshes the session and updates the timeout based on new expiration
  const refreshSession = async (): Promise<void> => {
    if (status !== "authenticated") {
      await handleLogout();
      return;
    }
    try {
      const newSession: Session | null = await update();
      if (!newSession?.expires) {
        console.error("Session refresh failed or returned no expiration.");
        await handleLogout();
        return;
      }
      setSessionTimeout(getExpirationTimeInSeconds(newSession.expires));
    } catch (error) {
      console.error("Session refresh error:", error);
      await handleLogout();
    }
  };

  // Extends the session when the user chooses to stay logged in
  const handleExtendSession = async () => {
    try {
      setShowModal(false);
      await refreshSession();
    } catch (error) {
      console.error("Failed to extend session:", error);
      await handleLogout();
    }
  };

  /**
   * Starts polling your server action for the token expiration.
   */
  function startTokenExpirationPolling(intervalMs: number = 60_000) {
    let timerId: ReturnType<typeof setInterval>;

    async function fetchAndCompare() {
      try {
        // 1. Get the JWT exp claim (in seconds since epoch)
        const token = await getToken();
        const expiration = token.exp;

        // 2. Compute how many seconds are left
        const nowSec = Math.floor(Date.now() / 1000);
        const secondsRemain = Math.max(0, expiration - nowSec);

        // 3. Update countdown state directly from token.exp
        setSessionTimeout(secondsRemain);

        // brianna they don't match, I think that's Shon's point
        // (TEMP) compare with session.expires:
        const tokenIso = new Date(expiration * 1000).toISOString();
        const sessionIso = session?.expires
          ? new Date(session.expires).toISOString()
          : "undefined";

        if (tokenIso !== sessionIso) {
          console.warn("⚠️ Expiry mismatch:", { tokenIso, sessionIso });
        }

        setSessionTimeout(getExpirationTimeInSeconds(tokenIso));
      } catch (err) {
        console.error("Error fetching token expiration:", err);
      }
    }

    // run immediately, then every interval
    fetchAndCompare();
    timerId = setInterval(fetchAndCompare, intervalMs);

    return () => clearInterval(timerId);
  }

  useEffect(() => {
    if (status === "authenticated") {
      const stop = startTokenExpirationPolling();
      return () => stop();
    }
  }, [status, session?.expires]);

  // --- Session Timeout Logic ---
  useEffect(() => {
    // Listen for logout events from other tabs
    logoutChannel.onmessage = (event) => {
      if (event === "logout") {
        // handleLogout(); might be better
        signOut({ redirect: false }); // Ensure all tabs sign out
      }
    };
    if (status !== "authenticated") return;

    let modalTimeoutId: NodeJS.Timeout | undefined;

    if (sessionTimeout === Infinity)
      return; // No timeout set, exit early
    else if (sessionTimeout <= 0) handleLogout();
    else if (sessionTimeout > MODAL_DISPLAY_SECONDS) {
      setShowModal(false);
      modalTimeoutId = setTimeout(
        () => {
          setShowModal(true);
        },
        (sessionTimeout - MODAL_DISPLAY_SECONDS) * 1000,
      ); // Schedule modal display
    } else setShowModal(true);

    // Cleanup function to clear the timeout when effect re-runs or component unmounts
    return () => clearTimeout(modalTimeoutId);
  }, [status, sessionTimeout]);

  useEffect(() => {
    // Listen for logout events from other tabs
    logoutChannel.onmessage = (event) => {
      if (event === "logout") {
        // handleLogout(); might be better
        signOut({ redirect: false }); // Ensure all tabs sign out
      }
    };

    return () => {
      logoutChannel.close();
    };
  }, []);

  if (status !== "authenticated") return null; // Don't render anything if not authenticated

  return (
    <>
      {showModal && (
        <LogoutWarningModal
          initialTimeLeft={MODAL_DISPLAY_SECONDS}
          onExtendSession={handleExtendSession}
          onLogout={handleLogout}
          showModal={showModal}
        />
      )}
    </>
  );
};

export default SessionTimeoutHandler;
