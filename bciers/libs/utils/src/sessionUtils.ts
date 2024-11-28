import { auth } from "@/dashboard/auth";
import { useSession } from "next-auth/react";

// use getSessionRole in server components
const getSessionRole = async () => {
  const session = await auth();
  if (!session?.user?.app_role) {
    throw new Error("Failed to retrieve session role");
  }

  return session.user.app_role;
};

// useSessionFole is for client components
const useSessionRole = () => {
  const session = useSession();
  if (!session?.data?.user?.app_role) {
    throw new Error("Failed to retrieve session role");
  }
  return session.data.user.app_role;
};

export { getSessionRole, useSessionRole };
