import Tiles from "@bciers/components/navigation/Tiles";
import Note from "@bciers/components/layout/Note";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";
import { auth } from "@/dashboard/auth";

export default async function Page() {
  const session = await auth();

  const isIndustryUser = session?.user?.app_role?.includes("industry");

  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/bciers/[IdProviderType]
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=bciers",
  )) as ContentItem[];

  // Build the navigation tiles
  return (
    <>
      {isIndustryUser && (
        <Note variant="important">
          <b>Important:</b> Please always ensure that the information in{" "}
          <b>Registration</b> is complete and accurate before submit or amend
          reports in <b>Reporting.</b>
        </Note>
      )}
      <Tiles tiles={data} />
    </>
  );
}
