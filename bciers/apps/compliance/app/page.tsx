import Tiles from "@bciers/components/navigation/Tiles";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";

export default async function Page() {
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/compliance/[IdProviderType]/role?
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=compliance",
  )) as ContentItem[];

  return (
    <>
      <Tiles tiles={data} />
    </>
  );
}
