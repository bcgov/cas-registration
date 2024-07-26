import { UUID } from "crypto";
import FacilityPage from "@/administration/app/components/facilities/FacilityPage";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID; facilityId: UUID }>;
}) {
  return (
    <FacilityPage
      facilityId={params.facilityId}
      operationId={params.operationId}
    />
  );
}
