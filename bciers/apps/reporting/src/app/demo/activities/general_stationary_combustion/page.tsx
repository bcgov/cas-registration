import ActivityPage from "../../../components/activities/Activity";
import { Suspense } from "react";

export default async function Page() {
  return (
  <Suspense fallback="Loading Schema">
    <ActivityPage />
  </Suspense>
  )
}
