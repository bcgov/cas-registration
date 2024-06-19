// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "apps/registration/app/components/facilities/types";
import FacilitiesPage from "apps/registration/app/components/routes/facilities/Page";

export default async function Page({
  params: { operation },
  searchParams,
}: Readonly<{
  params: { operation: string };
  searchParams: FacilitiesSearchParams;
}>) {
  return <FacilitiesPage operationId={operation} searchParams={searchParams} />;
}
