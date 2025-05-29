import { auth } from "@/dashboard/auth";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { useContext } from "react";
import { SessionRoleContext } from "./sessionRoleContext";

// use getSessionRole in server components
const getSessionRole = async () => {
  const session = await auth();
  if (!session?.user?.app_role) {
    throw new Error("Failed to retrieve session role");
  }

  return session.user.app_role as FrontEndRoles;
};

// useSessionRole is for client components
const useSessionRole = (): FrontEndRoles => {
  const sessionRole = useContext(SessionRoleContext);
  if (!sessionRole) {
    throw new Error("Session role is not available in the context");
  }
  return sessionRole as FrontEndRoles;
};

export { getSessionRole, useSessionRole, SessionRoleContext };
