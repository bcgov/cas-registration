"use client";

import getLogoutUrl from "@bciers/components/auth/getLogoutUrl";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

/**
 * Logout page containing an effect to logout the user from both the app and Keycloak.
 */

const logoutAction = async () => {
  const logoutUrl = await getLogoutUrl();
  signOut({
    redirect: true,
    redirectTo: logoutUrl || "/onboarding",
  });
};

export default function Page() {
  useEffect(() => {
    logoutAction();
  }, []);

  return <div>Logging out...</div>;
}
