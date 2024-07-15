// 🚩 flagging that for shared routes between roles, "page" code is a component for code maintainability
import { UUID } from "crypto";
import Facility from "@/administration/app/components/facilities/Facility";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID; facilityId: UUID }>;
}) {
  return (
    <Facility facilityId={params.facilityId} operationId={params.operationId} />
  );
}
