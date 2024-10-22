import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonSpinner";
import UserPage from "@/administration/app/components/profile/ProfilePage";

export default async function Page() {
  return (
    <>
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">
          Please update or verify your information
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <UserPage />
      </Suspense>
    </>
  );
}
