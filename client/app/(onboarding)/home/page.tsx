"use client";

// 🏷 import {named} can be significantly slower than import default
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid/Grid";
import events from "@/app/data/home/events.json";
import { signIn } from "next-auth/react";
import { getEnvValue } from "@/app/utils/actions";
/*
📚
In the app directory, nested folders are normally mapped to URL paths.
However, you can mark a folder as a Route Group to prevent the folder from being included in the route's URL path.
This allows you to organize your route segments and project files into logical groups without affecting the URL path structure, (useful in dynamic BreadCrumbs)
e.g. app\(onboarding)\home maps to route: http://localhost:3000/home
*/

export default function Page() {
  const fontSize = "text-2xl";
  const headerStyle = "text-bc-bg-blue text-2xl";
  const tableBorder = "border border-solid border-bc-bg-dark-grey";

  const handleIdirLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "idir" });
  };

  const handleBceidLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "bceidbusiness" });
  };

  const handleBceidSignupClick = async () => {
    // We don't have a build solution for the env variables in the frontend yet,
    // so we need to get the env value from the backend
    const env = await getEnvValue("NODE_ENV");
    if (env === "production") {
      window.open(
        "https://www.bceid.ca/register/business/",
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      window.open(
        `https://www.${env}.bceid.ca/register/business/`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <>
      <section className={fontSize}>
        <p>
          Welcome to the B.C. Industrial Emissions Reporting System (BCIERS), a
          web application for industrial operators to participate in the B.C.
          Output-Based Pricing System (B.C. OBPS).
        </p>

        <p>
          Operators who are eligible to participate in the B.C. OBPS will need
          to use this web application to start the registration process.
        </p>

        <p>
          Before getting started, take a moment to review the detailed{" "}
          <a href="ADD LINK HERE" target="_blank" rel="noopener noreferrer">
            guidance
          </a>
          .
        </p>
        <p>
          BCIERS will enable operators to apply for a B.C. Regulated Operation
          ID (BORO ID) for each industrial operation that is eligible to
          participate in the B.C. OBPS. A BORO ID is needed to claim a carbon
          tax exemption under the Carbon Tax Act starting April 1, 2024.
        </p>
      </section>
      {/*
      💻📲
      MUI responsive layout grid adapts to screen size and orientation, ensuring consistency across layouts.
      Fluid grids use columns that scale and resize content. A fluid grid's layout can use breakpoints to determine if the layout needs to change dramatically.
      Column widths are integer values between 1 and 12; they apply at any breakpoint and indicate how many columns are occupied by the component.

      Using breakpoints for responsive design, grid items will display in two columns on laptop & desktop and a single column on mobile & tablet,
      Using the order prop for stacking order, grid item 1 and 2 will be reverse order on mobile & tablet,
       */}
      <Grid
        container
        spacing={2}
        sx={{
          marginTop: "24px",
          marginBottom: "48px",
        }}
      >
        <Grid
          item
          xs={12}
          md={6}
          order={{ xs: 1, md: 1 }}
          sx={{
            fontSize: "24px",
            marginRight: {
              xs: "0px",
              md: "40px",
            },
          }}
        >
          <h2 className={headerStyle}>
            How to apply for a B.C. OBPS Regulated Operation ID
          </h2>
          <ol>
            <li>Log in as an industrial operator with your Business BCeID.</li>
            <li>Activate your industrial operator profile.</li>
            <li>
              Submit an application for each of your industrial operations.
            </li>
          </ol>
          <p>
            Upon review, each eligible industrial operation will receive a BORO
            ID.
          </p>
          <p>
            To check eligibility, and for further information about the B.C.
            OBPS, please visit the{" "}
            <a href="ADD LINK HERE" target="_blank" rel="noopener noreferrer">
              program website.
            </a>
          </p>
          <p>
            Please visit the{" "}
            <a
              href="https://www2.gov.bc.ca/gov/content?id=3EAC7D1EBBDA41F6937BA1F1A8A202F3"
              target="_blank"
              rel="noopener noreferrer"
            >
              carbon tax exemption
            </a>{" "}
            webpage to learn more about claiming an exemption from the carbon
            tax.
          </p>
        </Grid>
        <Grid
          item
          xs={12}
          md={5.5}
          order={{ xs: 2, md: 2 }}
          sx={{
            paddingLeft: {
              xs: "0px",
              md: "40px",
            },
          }}
        >
          <section className="flex flex-col items-center">
            <h2 className={`${headerStyle} w-full text-center`}>
              Log in as Industrial Operator
            </h2>
            <Button
              variant="contained"
              className="w-full md:max-w-[70%] bg-bc-bg-blue"
              onClick={handleBceidLogin}
            >
              Log in with Business BCeID
            </Button>
            <p>
              Don’t have a Business BCeID?{" "}
              <button
                className="border-none bg-transparent text-lg text-bc-link-blue"
                onClick={handleBceidSignupClick}
              >
                Create one here
              </button>
            </p>
          </section>
          <h2 className={headerStyle}>Key Dates</h2>
          <table
            className={`table-auto w-full text-lg border-collapse ${tableBorder}`}
          >
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[70%]" />
            </colgroup>
            <thead>
              <tr>
                <th className={`p-4 ${tableBorder}`}>Date</th>
                <th className={`p-4 ${tableBorder}`}>Event</th>
              </tr>
            </thead>
            <tbody>
              {events.map((row, index) => (
                <tr key={index} className="[&>td]:p-4">
                  <td
                    className={`px-2 py-4 ${tableBorder} whitespace-pre-line`}
                  >
                    {row.date}
                  </td>
                  <td className={`px-2 py-4 ${tableBorder}`}>{row.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <section className="flex flex-col items-center bg-bc-bg-light-grey my-10 py-8">
            <h2 className={headerStyle}>Contact us</h2>
            <p className="text-center">
              If you have any questions, please email us at <br />
              <a
                href="mailto:GHGRegulator@gov.bc.ca"
                className="text-black font-bold no-underline"
              >
                GHGRegulator@gov.bc.ca
              </a>
            </p>
          </section>
          <section className="flex flex-col items-center">
            <h2 className={`${headerStyle} w-full text-center`}>
              Log in as Government Employee
            </h2>
            <Button
              variant="outlined"
              className="w-full md:max-w-[70%]"
              onClick={handleIdirLogin}
            >
              Log in with IDIR
            </Button>
          </section>
        </Grid>
      </Grid>
    </>
  );
}
