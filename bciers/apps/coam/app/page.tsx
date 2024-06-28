import Tiles from "@bciers/components/navigation/Tiles";
import { fetchDashboardData } from "@bciers/actions/server";
import { ContentItem } from "@bciers/types";

export default async function Page() {
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/coam/[IdProviderType]/role?
  // const data = (await fetchDashboardData(
  //   "common/dashboard-data?dashboard=coam",
  // )) as ContentItem[];

  return (
    <>
   // Display role based tiles here
        {/* {data && <Tiles tiles={data} />} */}
        <p>test</p>
    </>
  );
}