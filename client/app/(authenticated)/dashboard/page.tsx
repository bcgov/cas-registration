"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppRoles, UserOperatorRoles } from "@/app/utils/enums";
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

export default function Page() {
  const { data: session } = useSession();
  const role = session?.user?.app_role;

  const [contents, setContents] = useState<ContentItem[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined" && role) {
      // 🛠️ Function to import the dashboard tiles basd on user's app_role
      const fetchData = async () => {
        let contentsModule;
        // Note: using a dynamic import path, i.e. dynamicPath = `@/app/data/dashboard/${role}.json`;, returns Error: Cannot find module '@/app/data/dashboard/*.json'
        console.log("!!!!!!!!!!1role", role);
        switch (role) {
          case AppRoles.CAS_ADMIN:
            contentsModule = await import(
              "@/app/data/dashboard/cas_admin.json"
            );
            break;
          case AppRoles.CAS_ANALYST:
            contentsModule = await import(
              "@/app/data/dashboard/cas_analyst.json"
            );
            break;
          case UserOperatorRoles.INDUSTRY_USER_ADMIN:
            contentsModule = await import(
              "@/app/data/dashboard/industry_user_admin.json"
            );
            break;
          case UserOperatorRoles.INDUSTRY_USER_REPORTER:
            contentsModule = await import(
              "@/app/data/dashboard/industry_user_reporter.json"
            );
            break;
          default:
            contentsModule = null;
            break;
        }
        if (contentsModule) {
          setContents(contentsModule.default);
        }
      };
      fetchData();
    }
  }, [role]); // dependencies array
  return (
    <div>
      {role === AppRoles.CAS_PENDING ? (
        // Display pending message
        <Card
          data-testid="dashboard-pending-message"
          sx={{ padding: 2, margin: 2, border: "none", boxShadow: "none" }}
        >
          <Typography variant="h5" component="div">
            Welcome to CAS Registration App
          </Typography>
          <Typography variant="body1" color="textSecondary" component="div">
            Your current status is pending approval.
          </Typography>
          <Typography variant="body1" color="textSecondary" component="div">
            Once approved, you will have access to the application.
          </Typography>
        </Card>
      ) : (
        // 🪜 create a grid layout using container prop to create a container that wraps the grid items
        <Grid container>
          {/* 🖥️📲 make items responsive using screensize breachpoints and style items to matching heights using sx */}
          {contents.map((content, index) => (
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
