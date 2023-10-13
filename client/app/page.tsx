import Link from "next/link";
import Image from "next/image";

// 🏷 import {named} can be significantly slower than import default
import Box from "@mui/material/Box";
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

export default function Page() {
  const features = [
    "Sets a performance standard",
    "Carbon is only priced above the standard",
    "Lower-emitting facilities earn credits",
    "Higher-emitting facilities pay more",
    "More carbon per unit of production = higher costs",
  ];
  const tableData = [
    { date: "2024-01-15", event: "Event 1" },
    { date: "2024-02-20", event: "Event 2" },
    { date: "2024-03-10", event: "Event 3" },
  ];
  const needs = [
    "A Business BCeID account associated with your operator (organization)",
  ];
  return (
    <>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box
          sx={{
            width: "640px",
          }}
        >
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
        </Box>

        <Box
          sx={{
            width: "640px",
            marginLeft: "100px",
          }}
        >
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
                {tableData.map((row, index) => (
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
            If you have any questions, please us at <br />
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
        </Box>
      </Box>
    </>
  );
}
