import { FacilitiesSearchParams } from "../../../components/facilities/types";
import FacilitiesPage from "../../../components/routes/facilities/Page";

export default async function Page({
  searchParams,
}: {
  searchParams: FacilitiesSearchParams;
}) {
  return <FacilitiesPage searchParams={searchParams} />;
}
