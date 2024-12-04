import Tiles from "@/app/components/navigation/Tiles";
import { getUserOperator } from "@/app/components/routes/select-operator/Page";
import { actionHandler } from "@bciers/actions";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { auth } from "@/dashboard/auth";

export default async function Page() {
  const session = await auth();

  const role = session?.user?.app_role || "";
  let operatorStatus = "";
  let userOperatorStatus = "";
  switch (role) {
    case FrontEndRoles.INDUSTRY_USER:
    case FrontEndRoles.INDUSTRY_USER_ADMIN:
      const operator = await actionHandler(
        "registration/v1/user-operators/current",
        "GET",
        "",
      );
      const userOperator = await getUserOperator();
      operatorStatus = operator.status;
      userOperatorStatus = userOperator.status;
      break;
  }
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
        <Tiles
          role={role}
          operatorStatus={operatorStatus}
          userOperatorStatus={userOperatorStatus}
        />
      )}
    </div>
  );
}
