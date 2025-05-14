"use client";

import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import LogoutWarningModal from "@bciers/components/auth/LogoutWarningModal";
import { getEnvValue } from "@bciers/actions";
import createThrottledEventHandler from "@bciers/components/auth/throttleEventsEffect";
import { Session } from "next-auth";
import * as Sentry from "@sentry/nextjs";

export const ACTIVITY_THROTTLE_SECONDS = 2 * 60; // Throttle user activity checks (4 minutes)
export const MODAL_DISPLAY_SECONDS = 5 * 60; // Seconds before timeout to show logout warning modal (5 minutes)

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
  const [logoutUrl, setLogoutUrl] = useState<string>("/");
  console.log("-----------logoutUrl", logoutUrl);
  useEffect(() => {
    // Fetch the logout URL from environment variables when component mounts
    getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL")
      .then((url) => setLogoutUrl(url || "/"))
      .catch((error) => {
        Sentry.captureException(error);
        console.error("Failed to fetch logout URL:", error);
      });
  }, []);

  const handleLogout = () => signOut({ redirectTo: logoutUrl });
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

  // --- Event Listener Setup ---
  useEffect(() => {
    if (status !== "authenticated") return;

    // Create a throttled handler to monitor user activity without overloading the system
    const setupHandler = createThrottledEventHandler(
      refreshSession,
      ["mousemove", "keydown", "mousedown", "scroll"], // Events indicating user activity
      ACTIVITY_THROTTLE_SECONDS,
    );

    let cleanup: (() => void) | undefined;
    if (!showModal) cleanup = setupHandler(); // Start listening for events and get cleanup function

    return () => {
      if (cleanup) cleanup(); // Cleanup function to remove event listeners when showModal changes or component unmounts
    };
  }, [showModal, status]);

  // --- Session Timeout Logic ---
  useEffect(() => {
    if (status !== "authenticated") return;

    let modalTimeoutId: NodeJS.Timeout | undefined;

    if (sessionTimeout === Infinity) return; // No timeout set, exit early
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
