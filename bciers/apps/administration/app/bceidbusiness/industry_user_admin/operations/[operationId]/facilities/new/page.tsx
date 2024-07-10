import { UUID } from "crypto";
import Facility from "@/registration/app/components/facilities/Facility";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID }>;
}) {
  return <Facility operationId={params.operationId} />;
}
