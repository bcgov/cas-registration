// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "../../../components/facilities/types";
import FacilitiesPage from "../../../components/routes/facilities/Page";

export default async function Page({
  searchParams,
}: {
  searchParams: FacilitiesSearchParams;
}) {
  return <FacilitiesPage searchParams={searchParams} />;
}
