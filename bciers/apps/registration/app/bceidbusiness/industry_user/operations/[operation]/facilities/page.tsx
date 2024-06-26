// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "apps/registration/app/components/facilities/types";
import FacilitiesPage from "apps/registration/app/components/routes/facilities/Page";

export default async function Page(
  operation: string,
  searchParams: FacilitiesSearchParams,
) {
  const operationId = operation;

  return (
    <FacilitiesPage operationId={operationId} searchParams={searchParams} />
  );
}
