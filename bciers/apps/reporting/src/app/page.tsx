import Tiles from "@bciers/components/navigation/Tiles";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";

export default async function Page() {
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/reporting/[IdProviderType]
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=reporting",
  )) as ContentItem[];

  // Build the navigation tiles
  return (
    <>
      <Tiles tiles={data} />
    </>
  );
}
