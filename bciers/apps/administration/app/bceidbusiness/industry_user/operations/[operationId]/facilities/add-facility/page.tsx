import { UUID } from "crypto";
import FacilityPage from "@/administration/app/components/facilities/FacilityPage";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID }>;
}) {
  return <FacilityPage operationId={params.operationId} />;
}
