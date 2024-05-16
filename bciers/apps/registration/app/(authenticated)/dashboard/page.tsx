import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Tiles from "@/app/components/dashboard/Tiles";
import { getUserOperator } from "@/app/components/routes/select-operator/Page";
import { actionHandler } from "@/app/utils/actions";
import { FrontEndRoles } from "@/app/utils/enums";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { getServerSession } from "next-auth";
import { TileContent } from "@/app/components/dashboard/types";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.app_role || "";
  let operatorStatus = "";
  let userOperatorStatus = "";
  switch (role) {
    case FrontEndRoles.INDUSTRY_USER:
    case FrontEndRoles.INDUSTRY_USER_ADMIN:
      const operator = await actionHandler(
        "registration/user-operator/user-operator-operator",
        "GET",
        "",
      );
      const userOperator = await getUserOperator();
      operatorStatus = operator.status;
      userOperatorStatus = userOperator.status;
      break;
  }

  // Mock API response data for shared dashboard tiles
  // Another revision after discussion with the team - we have decided to return the fully formed JSON data
  // from the API
  const mockBciersSharedDashboardTilesAPIData = [
    {
      title: "Registration",
      content:
        "View or update information of your operator, operations, facilities, and to submit BORO ID applications here.",
      links: [
        {
          href: "/dashboard",
          title: "My Operator",
        },
        {
          href: "/dashboard",
          title: "Operations",
        },
        {
          href: "/dashboard",
          title: "Contacts",
        },
        {
          href: "/dashboard",
          title: "Users",
        },
        {
          href: "/dashboard",
          title: "Register an Operation",
        },
        {
          href: "/dashboard",
          title: "Report an Event",
        },
      ],
    },
    {
      title: "Reporting",
      content:
        "Submit Annual Report for an operation, and to view or update previous years’ reports here.",
      links: [
        {
          href: "/dashboard/select-operator",
          title: "Submit Annual Reports",
        },
        {
          href: "/dashboard/select-operator",
          title: "View Past Submissions",
        },
      ],
    },
    {
      title: "Report a Problem",
      content: "Something wrong? Report problems to GHGRegulator@gov.bc.ca",
      href: "mailto:GHGRegulator@gov.bc.ca",
    },
  ] as TileContent[];

  // This is the mock API response data for the registration dashboard tiles
  // It uses the simpler registration tiles with no sub-links. The href is used to wrap the entire tile in an anchor tag
  // const mockRegistrationDashboardTilesAPIData = [
  //   {
  //     href: "/dashboard",
  //     content: "View or update information of your operator here.",
  //     title: "My Operator",
  //   },
  //   {
  //     href: "/dashboard",
  //     content:
  //       "View the operations owned by your operator, or to add new operation to your operator here.",
  //     title: "Operations",
  //   },
  //   {
  //     href: "/dashboard",
  //     content:
  //       "View the contacts of your operator, or to add new contact for your operator here.",
  //     title: "Contacts",
  //   },
  //   {
  //     href: "/dashboard",
  //     content:
  //       "View, approve or decline Business BCeID user access requests to your operator, or to assign access type to users here.",
  //     title: "Users",
  //   },
  //   {
  //     href: "/dashboard",
  //     content:
  //       "Track the registration of operations, or to start new registration here.",
  //     title: "Register an Operation",
  //   },
  //   {
  //     href: "/dashboard",
  //     content:
  //       "Report sales, transfer, closure, acquisition, divestment, change in operator or director control, temporary shut down, etc. here.",
  //     title: "Report an Event",
  //   },
  // ] as TileContent[];

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
        <Tiles tileData={mockBciersSharedDashboardTilesAPIData} />
      )}
    </div>
  );
}
