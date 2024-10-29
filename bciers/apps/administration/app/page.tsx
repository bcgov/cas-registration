import Tiles from "@bciers/components/navigation/Tiles";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";
import evalDashboardRules from "@bciers/utils/src/evalDashboardRules";

export default async function Page() {
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/administration/[IdProviderType]/role?
  let data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=administration",
  )) as ContentItem[];
  // Evaluate display conditions in the dashboard data
  data = await evalDashboardRules(data);

  return (
    <div>
      <Tiles tiles={data} />
    </div>
  );
}
