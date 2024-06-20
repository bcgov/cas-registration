import Tiles from "@bciers/components/navigation/Tiles";
import { fetchDashboardData } from "@bciers/actions/server";
import { ContentItem } from "@bciers/types";
import { auth } from "@/dashboard/auth";

export default async function Page() {
  const session = await auth();
  const role = session?.user?.app_role || "";
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/reporting/[IdProviderType]/role?
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=reporting",
  )) as ContentItem[];

  return (
    <>
      <Tiles tiles={data} />
    </>
  );
}
