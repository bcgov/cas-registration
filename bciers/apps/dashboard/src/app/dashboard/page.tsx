import { Tiles } from "@bciers/components/server";
import { fetchDashboardData } from "@bciers/actions/server";
import { ContentItem } from "@bciers/types";

export default async function Page() {
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/bciers/[IdProviderType]
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=bciers",
  )) as ContentItem[];

  // Build the navigation tiles
  return (
    <>
      <Tiles tiles={data} />
    </>
  );
}
