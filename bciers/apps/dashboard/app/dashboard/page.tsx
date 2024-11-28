import Tiles from "@bciers/components/navigation/Tiles";
import Note from "@bciers/components/layout/Note";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import evalDashboardRules from "@bciers/utils/src/evalDashboardRules";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

export default async function Page() {
  const role = await getSessionRole();
  const isIndustryUser = role.includes("industry");

  let data: ContentItem[] = [];

  // Check role before fetching data
  if (role && role !== FrontEndRoles.CAS_PENDING) {
    // 🚀 API fetch dashboard tiles
    // 🚩 Source: bc_obps/common/fixtures/dashboard/bciers/[IdProviderType]
    data = (await fetchDashboardData(
      "common/dashboard-data?dashboard=bciers",
    )) as ContentItem[];
    // Evaluate display rules in the dashboard data
    data = await evalDashboardRules(data);
  }

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
