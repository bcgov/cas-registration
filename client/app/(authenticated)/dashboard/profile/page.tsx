import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonSpinner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { IDP } from "@/app/utils/enums";
import User from "@/app/components/profile/User";

// 🏗️ Sync server component: dashboard\profile
export default async function Page() {
  const session = await getServerSession(authOptions);
  const isIdirUser = session?.identity_provider?.includes(IDP.IDIR);
  return (
    <>
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">
          Please update or verify your information{" "}
          {!isIdirUser ? "as the Operation Representative" : ""}
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <User />
      </Suspense>
    </>
  );
}
