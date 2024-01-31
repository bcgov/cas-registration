"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useSession } from "next-auth/react";
import { FrontEndRoles, OperatorStatus } from "@/app/utils/enums";
import reportAProblemTile from "@/app/data/dashboard/report_a_problem.json";
import bceidSelectOperatorTile from "@/app/data/dashboard/bceid/select_operator.json";
import bceidMyOperatorTile from "@/app/data/dashboard/bceid/my_operator.json";
import bceidOperationsTile from "@/app/data/dashboard/bceid/operations.json";
import bceidUsersTile from "@/app/data/dashboard/bceid/users.json";
import idirOperatorsTile from "@/app/data/dashboard/idir/operators.json";
import idirOperationsTile from "@/app/data/dashboard/idir/operations.json";
import idirUsersTile from "@/app/data/dashboard/idir/users.json";
/*
📚
In the app directory, nested folders are normally mapped to URL paths.
However, you can mark a folder as a Route Group to prevent the folder from being included in the route's URL path.
This allows you to organize your route segments and project files into logical groups without affecting the URL path structure, (useful in dynamic BreadCrumbs)
e.g. app\(authenticated)\dashboard maps to route: http://localhost:3000/dashboard
*/

// 📐 type for ContentItem used to build dashboard content tiles
type ContentItem = {
  title: string;
  content: string;
  links?: { title: string; href: string }[];
};

export default function Tiles({
  operatorStatus,
}: {
  operatorStatus: OperatorStatus;
}) {
  const { data: session } = useSession();
  const role = session?.user?.app_role;

  let contents: ContentItem[] | null = null;
  switch (role) {
    case FrontEndRoles.CAS_ADMIN:
      contents = [
        ...idirOperatorsTile,
        ...idirOperationsTile,
        ...idirUsersTile,
        ...reportAProblemTile,
      ];

      break;
    case FrontEndRoles.CAS_ANALYST:
      contents = [
        ...idirOperatorsTile,
        ...idirOperationsTile,
        ...reportAProblemTile,
      ];
      break;
    case "industry_user_admin":
      if (operatorStatus === "Pending" || operatorStatus === "Approved") {
        contents = [
          ...bceidMyOperatorTile,
          ...bceidOperationsTile,
          ...bceidUsersTile,
          ...reportAProblemTile,
        ];
      } else {
        contents = [...bceidSelectOperatorTile, ...reportAProblemTile];
      }
      break;
    case FrontEndRoles.INDUSTRY_USER:
      if (operatorStatus === "Pending" || operatorStatus === "Approved") {
        contents = [
          ...bceidMyOperatorTile,
          ...bceidOperationsTile,
          ...reportAProblemTile,
        ];
      } else {
        contents = [...bceidSelectOperatorTile, ...reportAProblemTile];
      }
      break;
  }

  return (
    <div>
      {role === FrontEndRoles.CAS_PENDING ? (
        // Display pending message
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
        // 🪜 create a grid layout using container prop to create a container that wraps the grid items
        <Grid container>
          {/* 🖥️📲 make items responsive using screensize breachpoints and style items to matching heights using sx */}
          {contents &&
            contents.map((content, index) => (
              <Grid
                key={index}
                item
                component={Card}
                xs={12}
                sm={6}
                md={3}
                sx={{
                  margin: 6,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent data-testid="dashboard-nav-card">
                  <Typography variant="h5" component="h2">
                    {content.title}
                  </Typography>

                  <Typography component="p" color="textSecondary">
                    {content.content}
                  </Typography>
                </CardContent>
                {/* build bottom links */}
                {typeof content.links === "object" &&
                  content.links.map((link, i) => (
                    <Link
                      key={i}
                      href={link.href}
                      sx={{ textDecoration: "none", padding: "8px" }}
                    >
                      {link.title}
                    </Link>
                  ))}
              </Grid>
            ))}
        </Grid>
      )}
    </div>
  );
}
