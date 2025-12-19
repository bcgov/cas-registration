// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "@/administration/app/components/facilities/types";
import FacilitiesPage from "@/administration/app/components/facilities/FacilitiesPage";
import { UUID } from "crypto";

export default async function Page(
  props: Readonly<{
    params: Promise<{ operationId: UUID }>;
    searchParams: Promise<FacilitiesSearchParams>;
  }>,
) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { operationId } = params;

  return (
    <FacilitiesPage
      operationId={operationId}
      searchParams={searchParams}
      isExternalUser={true}
    />
  );
}
