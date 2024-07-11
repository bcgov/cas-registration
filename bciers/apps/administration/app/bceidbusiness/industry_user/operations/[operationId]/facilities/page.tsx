// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "@/administration/app/components/facilities/types";
import FacilitiesPage, {
  ExternalFacilitiesLayout,
} from "@/administration/app/components/routes/facilities/Page";
import { UUID } from "crypto";

export default async function Page({
  params: { operationId },
  searchParams,
}: Readonly<{
  params: { operationId: UUID };
  searchParams: FacilitiesSearchParams;
}>) {
  return (
    <ExternalFacilitiesLayout>
      <FacilitiesPage operationId={operationId} searchParams={searchParams} />
    </ExternalFacilitiesLayout>
  );
}
