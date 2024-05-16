import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Tiles from "@/app/components/dashboard/Tiles";
import { getUserOperator } from "@/app/components/routes/select-operator/Page";
import { actionHandler } from "@/app/utils/actions";
import { FrontEndRoles } from "@/app/utils/enums";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { getServerSession } from "next-auth";
import {
  IncomingTileData,
  TileContent,
} from "@/app/components/dashboard/types";
import reportAProblem from "@/app/data/dashboard_v2/report_a_problem.json";

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

  const mockTileData = [
    {
      type: "select_operator",
      links: [
        "my_operator",
        "operations",
        "contacts",
        "users",
        "register_an_operation",
        "report_an_event",
      ],
    },
    {
      type: "operations",
    },
    {
      type: "users",
    },
  ];

  const mockTileData2 = [
    {
      type: "select_operator",
      // If we use this format to display registration links we may be able to re-use
      // the same serivce layer for the registration dashboard tiles
      links: [
        {
          type: "my_operator",
        },
        {
          type: "operations",
        },
        {
          type: "contacts",
        },
        {
          type: "users",
        },
        {
          type: "register_an_operation",
        },
        {
          type: "report_an_event",
        },
      ],
    },
    {
      type: "operations",
    },
    {
      type: "users",
    },
  ];

  const buildContent = async (
    role: "bceid" | "idir",
    data: IncomingTileData[],
  ) => {
    const contents = [];

    for (const tile of data) {
      try {
        // Dynamically import the module
        const module = await import(
          `@/app/data/dashboard_v2/${role}/${tile.type}.json`
        );

        const content = module.default;

        // If the tile has links, resolve which links to display
        const links =
          tile?.links &&
          tile?.links.map((link: string) => {
            if (!content?.links[link]) {
              throw new Error("Link not found");
            }
            return content?.links[link];
          });

        contents.push({
          ...content,
          links,
        });
      } catch (error) {
        console.error("Error building content", error);
      }
    }

    // All roles have access to the report a problem tile
    contents.push(reportAProblem);
    return contents;
  };

  const contents = (await buildContent("bceid", mockTileData)) as TileContent[];

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
        <Tiles tileData={contents} />
      )}
    </div>
  );
}
