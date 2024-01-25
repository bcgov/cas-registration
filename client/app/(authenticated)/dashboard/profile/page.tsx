import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonSpinner";
import User from "@/app/components/routes/profile/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🏗️ Sync server component: dashboard\profile
export default async function Page() {
  const session = await getServerSession(authOptions);
  const appRole = session?.user?.app_role;
  const isCasInternal =
    appRole?.includes("cas") && !appRole?.includes("pending");
  return (
    <>
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">
          Please update or verify your information{" "}
          {!isCasInternal ? "as the Operation Representative" : ""}
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <User />
      </Suspense>
    </>
  );
}
