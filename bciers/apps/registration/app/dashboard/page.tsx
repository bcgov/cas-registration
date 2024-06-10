import Tiles from "@bciers/components/navigation/Tiles";
import { FrontEndRoles } from "@/app/utils/enums";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { fetchDashboardData } from "@bciers/actions/server";
import { ContentItem } from "@bciers/types";
import { auth } from "@/dashboard/auth";

export default async function Page() {
  const session = await auth();
  const role = session?.user?.app_role || "";
  const data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=registration",
  )) as ContentItem[];

  return (
    <div>
      {role === FrontEndRoles.CAS_PENDING ? (
        <>
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
        </>
      ) : (
        // Display role based tiles here
        <Tiles tiles={data} />
      )}
    </div>
  );
}
