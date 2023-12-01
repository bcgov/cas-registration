import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonSpinner";
import User from "@/app/components/routes/profile/User";

// 🏗️ Server component for route: dashboard\profile
export default function Page() {
  return (
    <>
      <h1>Please verify or update your information</h1>
      <Suspense fallback={<Loading />}>
        <User />
      </Suspense>
    </>
  );
}
