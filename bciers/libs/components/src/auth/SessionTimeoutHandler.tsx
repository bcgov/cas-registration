"use client";

import React, { useEffect, useRef, useState } from "react";
import LogoutWarningModal from "@bciers/components/auth/LogoutWarningModal";
import { getEnvValue, getToken } from "@bciers/actions";
import { Session } from "next-auth";
import * as Sentry from "@sentry/nextjs";
import { signOut, useSession } from "next-auth/react";
import { BroadcastChannel } from "broadcast-channel";

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

  // logout broadcast channel (logout the user from all tabs if they click the modal logout button)
  useEffect(() => {
    const logoutChannel = new BroadcastChannel("logout");
    logoutChannelRef.current = logoutChannel;

    logoutChannel.onmessage = async (event) => {
      if (event === "logout") {
        const logoutUrl = await getLogoutUrl();
        window.location.href = logoutUrl || "/"; // or `logoutUrl`
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
      extendSessionChannelRef.current?.postMessage("extend-session");
      await refreshSession();
    } catch (error) {
      console.error("Failed to extend session:", error);
      await handleLogout();
    }
  };

  function startTokenExpirationPolling(intervalMs: number = 60_000) {
    let timerId: ReturnType<typeof setInterval>;

    async function fetchAndCompare() {
      try {
        const token = await getToken();
        const expiration = token.exp;
        console.log("token expiration", expiration);
        const nowSec = Math.floor(Date.now() / 1000);
        const secondsRemain = Math.max(0, expiration - nowSec);

        setSessionTimeout(secondsRemain);

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

    fetchAndCompare();
    timerId = setInterval(fetchAndCompare, intervalMs);

    return () => clearInterval(timerId);
  }

  useEffect(() => {
    if (status === "authenticated") {
      const stop = startTokenExpirationPolling(5_000);
      return () => stop();
    }
  }, [status, session?.expires]);

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
