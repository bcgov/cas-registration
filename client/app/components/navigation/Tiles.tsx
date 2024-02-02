"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { FrontEndRoles, OperatorStatus } from "@/app/utils/enums";
import reportAProblemTile from "@/app/data/dashboard/report_a_problem.json";
import bceidSelectOperatorTile from "@/app/data/dashboard/bceid/select_operator.json";
import bceidMyOperatorTile from "@/app/data/dashboard/bceid/my_operator.json";
import bceidOperationsTile from "@/app/data/dashboard/bceid/operations.json";
import bceidUsersTile from "@/app/data/dashboard/bceid/users.json";
import idirOperatorsTile from "@/app/data/dashboard/idir/operators.json";
import idirOperationsTile from "@/app/data/dashboard/idir/operations.json";
import idirUsersTile from "@/app/data/dashboard/idir/users.json";

// 📐 type for ContentItem used to build dashboard content tiles
type ContentItem = {
  title: string;
  content: string;
  links?: { title: string; href: string }[];
};

export default function Tiles({
  role,
  operatorStatus,
}: {
  role: string;
  operatorStatus: string;
}) {
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
    case FrontEndRoles.INDUSTRY_USER_ADMIN:
      if (
        operatorStatus === OperatorStatus.PENDING ||
        operatorStatus === OperatorStatus.APPROVED
      ) {
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
      if (
        operatorStatus === OperatorStatus.PENDING ||
        operatorStatus === OperatorStatus.APPROVED
      ) {
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
    <>
      <Grid container>
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
    </>
  );
}
