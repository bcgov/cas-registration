import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonSpinner";
import User from "@/app/components/routes/profile/User";

// 🏗️ Server component for route: dashboard\profile
export default function Page() {
  return (
    <>
      <div className="w-full form-group field field-object form-heading-label">
        <label className="inline-block">
          Please update or verify your information
        </label>
      </div>
      <Suspense fallback={<Loading />}>
        <User />
      </Suspense>
    </>
  );
}
