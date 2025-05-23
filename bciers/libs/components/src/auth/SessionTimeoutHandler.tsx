"use client";

import React, { useEffect, useRef, useState } from "react";
import LogoutWarningModal from "@bciers/components/auth/LogoutWarningModal";
import { getEnvValue, getToken } from "@bciers/actions";
import { Session } from "next-auth";
import * as Sentry from "@sentry/nextjs";
import { signOut, useSession } from "next-auth/react";
import { BroadcastChannel } from "broadcast-channel";
import createThrottledEventHandler from "./throttleEventsEffect";

export const ACTIVITY_THROTTLE_SECONDS = 15; // Seconds to throttle user activity events
export const MODAL_DISPLAY_SECONDS = 30; // Seconds before timeout to show logout warning modal (5 minutes);

const getExpirationTimeInSeconds = (expires: string | undefined): number => {
  if (!expires) return Infinity;
  return Math.max(0, (new Date(expires).getTime() - Date.now()) / 1000);
};

const SessionTimeoutHandler: React.FC = () => {
  const { data: session, status, update } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<number>(
    getExpirationTimeInSeconds(session?.expires),
  );
  console.log("sessionTimeout", sessionTimeout);
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

  // logout broadcast channel (Redirect the user from all tabs if they click the modal logout button. Nextauth handles the actual logging out)
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

  // extend session broadcast channel (extend the session in all tabs if a user clicks the modal extend session button)
  useEffect(() => {
    const extendSessionChannel = new BroadcastChannel("extend-session");
    extendSessionChannelRef.current = extendSessionChannel;

    extendSessionChannel.onmessage = async (event) => {
      if (event === "extend-session") {
        await refreshSession();
      }
    };

    return () => {
      extendSessionChannel.close();
    };
  }, []);

  const handleLogout = async () => {
    // broadcast logout to other browser tabs
    logoutChannelRef.current?.postMessage("logout");
    const logoutUrl = await getLogoutUrl();
    await signOut({ redirectTo: logoutUrl || "/" });
  };

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

  // / --- Event Listener Setup ---
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

  useEffect(() => {
    if (status !== "authenticated") return;

    let modalTimeoutId: NodeJS.Timeout | undefined;

    if (sessionTimeout === Infinity) return;
    else if (sessionTimeout <= 0) handleLogout();
    else if (sessionTimeout > MODAL_DISPLAY_SECONDS) {
      setShowModal(false);
      modalTimeoutId = setTimeout(
        () => {
          setShowModal(true);
        },
        (sessionTimeout - MODAL_DISPLAY_SECONDS) * 1000,
      );
    } else {
      setShowModal(true);
    }

    return () => {
      clearTimeout(modalTimeoutId);
    };
  }, [status, sessionTimeout]);

  if (status !== "authenticated") return null;

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
