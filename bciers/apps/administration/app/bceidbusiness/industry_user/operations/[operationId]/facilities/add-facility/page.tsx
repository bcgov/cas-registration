import { UUID } from "crypto";
import FacilityPage from "@/administration/app/components/facilities/FacilityPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page(props: {
  params: Promise<Readonly<{ operationId: UUID }>>;
}) {
  const params = await props.params;
  return (
    <Suspense fallback={<Loading />}>
      <FacilityPage operationId={params.operationId} />
    </Suspense>
  );
}
