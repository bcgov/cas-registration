"use client";

import React, { useEffect, useRef, useState } from "react";
import LogoutWarningModal from "@bciers/components/auth/LogoutWarningModal";
import { getEnvValue } from "@bciers/actions";
import { Session } from "next-auth";
import * as Sentry from "@sentry/nextjs";
import { getSession, signOut, useSession } from "next-auth/react";
import { BroadcastChannel } from "broadcast-channel";
import createThrottledEventHandler from "./throttleEventsEffect";

export const ACTIVITY_THROTTLE_SECONDS = 4; // Seconds to throttle user activity
export const MODAL_DISPLAY_SECONDS = 5 * 60; // Seconds before timeout to show logout warning modal (5 minutes);

const getExpirationTimeInSeconds = (
  expires: string | undefined,
): number | null => {
  if (!expires) return null;
  return Math.max(0, (new Date(expires).getTime() - Date.now()) / 1000);
};

const SessionTimeoutHandler: React.FC = () => {
  const { data: session, status, update } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(
    getExpirationTimeInSeconds(session?.expires),
  );

  const isRefreshingRef = useRef(false); // Lock for preventing concurrent updates
  const logoutChannelRef = useRef<BroadcastChannel | null>(null);
  const extendSessionChannelRef = useRef<BroadcastChannel | null>(null);

  const getLogoutUrl = async () => {
    const logoutUrl = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
    if (!logoutUrl) {
      Sentry.captureException("Failed to fetch logout URL");
      console.error("Failed to fetch logout URL");
    }
    return logoutUrl;
  };

  const handleLogout = async () => {
    // broadcast logout to other browser tabs
    logoutChannelRef.current?.postMessage("logout");
    const logoutUrl = await getLogoutUrl();
    try {
      await signOut({ redirect: true, redirectTo: logoutUrl || "/" });
    } finally {
      // signOut's redirectTo doesn't work in some cases, so we manually redirect as well https://github.com/nextauthjs/next-auth/issues/10944
      setTimeout(() => {
        window.location.href = logoutUrl || "/";
      }, 500); // Let `signOut` try to redirect first
    }
  };

  // Refreshes the session and updates the timeout based on new expiration
  const refreshSession = async (): Promise<void> => {
    console.log("Refreshing session...");
    if (isRefreshingRef.current || status !== "authenticated") return;
    isRefreshingRef.current = true;
    try {
      const newSession: Session | null = await update();
      if (!newSession?.expires) {
        console.error("Session refresh failed or returned no expiration.");
        await handleLogout();
        return;
      }
      setSessionTimeout(getExpirationTimeInSeconds(newSession.expires));
    } catch (error) {
      Sentry.captureException(error);
      console.error("Session refresh error:", error);
      await handleLogout();
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // logout broadcast channel (Redirect the user from all tabs if they click the modal logout button. Nextauth already handles the actual logging out)
  useEffect(() => {
    const logoutChannel = new BroadcastChannel("logout");
    logoutChannelRef.current = logoutChannel;

    logoutChannel.onmessage = async (event) => {
      if (event === "logout") {
        const logoutUrl = await getLogoutUrl();
        window.location.href = logoutUrl || "/";
      }
    };

    return () => {
      logoutChannel.close();
    };
  }, []);

  // extend session broadcast channel (get the new expiry in all tabs if a user clicks the modal extend session button)
  useEffect(() => {
    const extendSessionChannel = new BroadcastChannel("extend-session");
    extendSessionChannelRef.current = extendSessionChannel;

    extendSessionChannel.onmessage = async (event) => {
      if (event === "extend-session") {
        // getSession might return null if the session is expired
        const extendedSession = await getSession();
        if (extendedSession?.expires) {
          setSessionTimeout(
            getExpirationTimeInSeconds(extendedSession.expires),
          );
        } else {
          await handleLogout(); // fallback
        }
      }
    };

    return () => {
      extendSessionChannel.close();
    };
  }, []);

  // Extends the session when the user chooses to stay logged in
  const handleExtendSession = async () => {
    try {
      setShowModal(false);
      await refreshSession();
      // broadcast extension to other browser tabs
      extendSessionChannelRef.current?.postMessage("extend-session");
    } catch (error) {
      console.error("Failed to extend session:", error);
      await handleLogout();
    }
  };

  // --- Event Listener Setup ---
  useEffect(() => {
    if (status !== "authenticated" || showModal) return;

    // Only set up event listeners if the modal is not open
    const handleActivity = async (event: Event) => {
      // Only reset the session timeout for visibilitychange when document is visible
      if (
        event.type === "visibilitychange" &&
        document.visibilityState !== "visible"
      )
        return; // Ignore when tab is hidden

      extendSessionChannelRef.current?.postMessage("extend-session");
      await refreshSession();
    };

    // Create a throttled handler to monitor user activity without overloading the system
    const setupHandler = createThrottledEventHandler(
      handleActivity,
      ["mousemove", "keydown", "mousedown", "scroll", "visibilitychange"], // Events indicating user activity
      ACTIVITY_THROTTLE_SECONDS,
    );
    const cleanup = setupHandler(); // Start listening for events

    // Prevent next-auth's default visibilitychange handling when modal is open
    const preventDefaultVisibilityChange = (event: Event) => {
      if (showModal) event.stopImmediatePropagation();
    };

    document.addEventListener(
      "visibilitychange",
      preventDefaultVisibilityChange,
      { capture: true },
    ); // Capture phase to prevent default behavior

    return () => {
      if (cleanup) cleanup(); // Cleanup function to remove event listeners when showModal changes or component unmounts
      document.removeEventListener(
        "visibilitychange",
        preventDefaultVisibilityChange,
        { capture: true },
      );
    };
  }, [showModal, status]);

  // --- Session Timeout Logic ---
  useEffect(() => {
    if (status !== "authenticated") return;

    let modalTimeoutId: NodeJS.Timeout | undefined;

    if (sessionTimeout === null) return; // No timeout set, exit early
    else if (sessionTimeout <= 0)
      handleLogout()
        .then()
        .catch((e) => console.error("Error logging out:", e));
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
