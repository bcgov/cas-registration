import Tiles from "@bciers/components/navigation/Tiles";
import Note from "@bciers/components/layout/Note";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";
import { auth } from "@/dashboard/auth";

import { FrontEndRoles } from "@bciers/utils/enums";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

export default async function Page() {
  const session = await auth();

  const role = session?.user?.app_role || "";
  const isIndustryUser = role.includes("industry");

  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/bciers/[IdProviderType]
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=bciers",
  )) as ContentItem[];

  return (
    <div>
      {role === FrontEndRoles.CAS_PENDING ? (
        <Card
          data-testid="dashboard-pending-message"
          sx={{ padding: 2, margin: 2, border: "none", boxShadow: "none" }}
        >
          <Typography variant="h5" component="div">
            Welcome to B.C. Industrial Emissions Reporting System
          </Typography>
          <Typography variant="body1" color="textSecondary" component="div">
            Your access request is pending approval.
          </Typography>
          <Typography variant="body1" color="textSecondary" component="div">
            Once approved, you can log back in with access to the system.
          </Typography>
        </Card>
      ) : (
        <>
          {isIndustryUser && (
            <Note variant="important">
              <b>Important:</b> Please always ensure that the information in{" "}
              <b>Registration</b> is complete and accurate before submitting or
              amending reports in <b>Reporting.</b>
            </Note>
          )}
          <Tiles tiles={data} />
        </>
      )}
    </div>
  );
}
