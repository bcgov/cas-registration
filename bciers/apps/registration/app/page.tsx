import Tiles from "@bciers/components/navigation/Tiles";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";

export default async function Page() {
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/registration/[IdProviderType]/role?
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=registration",
  )) as ContentItem[];

  return (
    <>
      <Tiles tiles={data} />
    </>
  );
}
