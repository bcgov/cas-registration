import { redirect } from "next/navigation";
import { getOperatorFromUser } from "@/app/(authenticated)/dashboard/page";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const isAuthorizedCasUser = async () => {
  const session = await getServerSession(authOptions);
  const appRole = session?.user?.app_role;
  return appRole?.includes("cas") && !appRole?.includes("pending")
    ? true
    : false;
};

export const redirectIfOperatorStatusUnauthorized = async () => {
  // Authorized CAS users are allowed to see all operations
  if (await isAuthorizedCasUser()) return;

  //   Industry users are only allowed to see their operations if their operator is approved
  let redirectPath;
  try {
    const operator = await getOperatorFromUser();
    if (operator.status !== "Pending" || operator.status !== "Approved") {
      redirectPath = "/dashboard";
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
};
