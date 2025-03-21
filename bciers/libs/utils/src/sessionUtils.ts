import { auth } from "@/dashboard/auth";
import { useSession } from "next-auth/react";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { mockSession } from "@/dashboard/auth/mockSession";

// use getSessionRole in server components
const getSessionRole = async () => {
  const session = process.env.NEXT_PUBLIC_BYPASS_AUTH
    ? mockSession
    : await auth();
  if (!session?.user?.app_role) {
    throw new Error("Failed to retrieve session role");
  }

  return session.user.app_role as FrontEndRoles;
};

// useSessionRole is for client components
const useSessionRole = () => {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH)
    return mockSession.user.app_role as FrontEndRoles;
  const session = useSession();
  if (!session?.data?.user?.app_role) {
    throw new Error("Failed to retrieve session role");
  }
  return session.data.user.app_role as FrontEndRoles;
};

export { getSessionRole, useSessionRole };
