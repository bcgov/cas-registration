// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "apps/registration/app/components/facilities/types";
import FacilitiesPage, {
  ExternalUserLayout,
} from "apps/registration/app/components/facilities/Facilities";
import { UUID } from "crypto";

export default async function Page({
  params: { operationId },
  searchParams,
}: Readonly<{
  params: { operationId: UUID };
  searchParams: FacilitiesSearchParams;
}>) {
  return (
    <>
      <ExternalUserLayout />
      <FacilitiesPage operationId={operationId} searchParams={searchParams} />
    </>
  );
}
