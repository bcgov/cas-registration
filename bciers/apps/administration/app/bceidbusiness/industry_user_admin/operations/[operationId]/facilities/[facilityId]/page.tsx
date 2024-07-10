import { UUID } from "crypto";
import Facility from "@/registration/app/components/facilities/Facility";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID; facilityId: UUID }>;
}) {
  return (
    <Facility facilityId={params.facilityId} operationId={params.operationId} />
  );
}
