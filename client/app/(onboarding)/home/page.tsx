import Link from "next/link";
import Image from "next/image";

// 🏷 import {named} can be significantly slower than import default
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid/Grid";

import events from "@/app/data/home/events.json";
import features from "@/app/data/home/features.json";
import needs from "@/app/data/home/needs.json";
/*
📚
In the app directory, nested folders are normally mapped to URL paths.
However, you can mark a folder as a Route Group to prevent the folder from being included in the route's URL path.
This allows you to organize your route segments and project files into logical groups without affecting the URL path structure, (useful in dynamic BreadCrumbs)
e.g. app\(onboarding)\home maps to route: http://localhost:3000/home
*/

export default function Page() {
  return (
    <>
      {/*
      💻📲
      MUI responsive layout grid adapts to screen size and orientation, ensuring consistency across layouts.
      Fluid grids use columns that scale and resize content. A fluid grid's layout can use breakpoints to determine if the layout needs to change dramatically.
      Column widths are integer values between 1 and 12; they apply at any breakpoint and indicate how many columns are occupied by the component.

      Using breakpoints for responsive design, grid items will display in two columns on laptop & desktop and a single column on mobile & tablet,
      Using the order prop for stacking order, grid item 1 and 2 will be reverse order on mobile & tablet,
       */}
      <Grid container spacing={2} p={1}>
        <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
          <Typography
            color="secondary"
            sx={{
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "29.05px",
            }}
          >
            What is the Output-Based Pricing System (OBPS)?
          </Typography>
          <Typography
            component="div"
            sx={{
              marginTop: "20px",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "36px",
            }}
          >
            The OBPS is designed to ensure there is a price incentive for
            industrial emitters to reduce their greenhouse gas emissions and
            spur innovation while maintaining competitiveness and protecting
            against “carbon leakage” (i.e. the risk of industrial facilities
            moving from one region to another to avoid paying a price on carbon
            pollution). Please see additional information on our{" "}
            <Link href="/program-website">program website.</Link>
          </Typography>
          <Typography
            sx={{
              marginTop: "10px",
              fontWeight: 700,
            }}
          >
            Key features of the BC OBPS include:
          </Typography>
          <List>
            {features.map((feature, index) => (
              <ListItem
                key={index}
                sx={{
                  paddingLeft: "8px", // Adjust the left indentation here
                }}
              >
                <ListItemText
                  primary={`• ${feature}`} // Add a bullet (•) before each feature
                  primaryTypographyProps={{
                    variant: "body1", // Optional: Apply a specific typography style
                    sx: {
                      lineHeight: "1.2",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Image
            alt="chart for comparing industrial carbon pricing systems"
            src="/img/registration/image5.svg"
            height={389.49}
            width={650}
            style={{ marginTop: "25px" }}
          />
          <Image
            alt="chart for compliance mechanisms in a B.C. output based pricing system"
            src="/img/registration/image6.svg"
            height={443.08}
            width={650}
            style={{ marginTop: "45px" }}
          />
        </Grid>
        <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
          <Typography
            color="secondary"
            sx={{
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "29.05px",
            }}
          >
            Key Dates
          </Typography>
          <TableContainer
            sx={{
              marginTop: "30px",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid black",
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: "21.78px",
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid black",
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: "21.78px",
                    }}
                  >
                    Event
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black" }}
                    >
                      {row.date}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black" }}
                    >
                      {row.event}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>{" "}
          <Typography
            color="secondary"
            sx={{
              marginTop: "40px",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "29.05px",
            }}
          >
            How to register BC OBPS
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{
              marginTop: "20px",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "36px",
            }}
          >
            Please see the{" "}
            <Link href="/completeguidance ">
              complete guidance for registration
            </Link>
          </Typography>
          <Typography
            sx={{
              marginTop: "10px",
              fontWeight: 700,
            }}
          >
            User will need:
          </Typography>
          <List>
            {needs.map((need, index) => (
              <ListItem
                key={index}
                sx={{
                  paddingLeft: "8px", // Adjust the left indentation here
                }}
              >
                <ListItemText
                  primary={`• ${need}`} // Add a bullet (•) before each feature
                  primaryTypographyProps={{
                    variant: "body1", // Optional: Apply a specific typography style
                    sx: {
                      lineHeight: "1.2",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="body1" component="div">
            If you have any questions, please email us at <br />
            <Link href="mailto:GHGRegulator@gov.bc.ca">
              <span
                style={{
                  color: "black",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                GHGRegulator@gov.bc.ca
              </span>
            </Link>
          </Typography>
          {/* TEMP Links */}
          <Typography
            color="secondary"
            sx={{
              marginTop: "40px",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "29.05px",
            }}
          >
            Workflows
          </Typography>
          <Typography variant="body1" component="div">
            Logging in as a prime admin:{" "}
            <Link href="/dashboard/select-operator">
              <span
                style={{
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Select Operator Page
              </span>
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
