import { Tiles } from "@bciers/components/server";
import { auth } from "@/dashboard/auth";
import { fetchDashboardData } from "@bciers/actions/server";
import { ContentItem } from "@bciers/types";

export default async function Page() {
  // Get the user's identity provider
  const session = await auth();
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
