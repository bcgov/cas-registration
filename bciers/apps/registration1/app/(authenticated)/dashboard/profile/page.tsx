import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonSpinner";

import { IDP } from "@bciers/utils/src/enums";
import User from "@/app/components/routes/profile/Page";
import { auth } from "@/dashboard/auth";

// 🏗️ Sync server component: dashboard\profile
export default async function Page() {
  const session = await auth();
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
