"use client";

// 🏷 import {named} can be significantly slower than import default
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid/Grid";
import events from "@/dashboard/app/data/home/events.json";
import { signIn } from "next-auth/react";
import { getEnvValue } from "@bciers/actions";
import {
  bcObpsLink,
  bcObpsGuidanceLink,
  carbonTaxExemptionLink,
} from "@bciers/utils/src/urls";
/*
📚
In the app directory, nested folders are normally mapped to URL paths.
However, you can mark a folder as a Route Group to prevent the folder from being included in the route's URL path.
This allows you to organize your route segments and project files into logical groups without affecting the URL path structure, (useful in dynamic BreadCrumbs)
e.g. app\(onboarding)\home maps to route: http://localhost:3000/home
*/

export default function Page() {
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

  // 💻📲
  // MUI responsive layout grid adapts to screen size and orientation, ensuring consistency across layouts.
  // Fluid grids use columns that scale and resize content. A fluid grid's layout can use breakpoints to determine if the layout needs to change dramatically.
  // Column widths are integer values between 1 and 12; they apply at any breakpoint and indicate how many columns are occupied by the component.
  //
  // Using breakpoints for responsive design, grid items will display in two columns on laptop & desktop and a single column on mobile & tablet,
  // Using the order prop for stacking order, grid item 1 and 2 will be reverse order on mobile & tablet,
  return (
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
          marginRight: {
            xs: "0px",
            lg: "40px",
          },
        }}
      >
        <section>
          <h1 className={`${headerStyle} text-3xl`}>
            Welcome to the B.C. Industrial Emissions Reporting System
          </h1>
          This web application is intended for use by:
          <ol>
            <li>
              Industrial operators that have an obligation to register and
              report under the Greenhouse Gas Industrial Reporting and Control
              Act (GGIRCA)
            </li>
            <li>
              Participants in the B.C. Output Based Pricing System (B.C. OBPS),
              to meet their compliance obligations.
            </li>
          </ol>
        </section>
        <section>
          <h2 className={headerStyle}>Helpful links</h2>
          <ul>
            <li>
              Before getting started, please review the{" "}
              <a
                href={bcObpsGuidanceLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                B.C. OBPS Program and Reporting Guidance.
              </a>
            </li>
            <li>
              For information on the B.C. OBPS, please visit the{" "}
              <a href={bcObpsLink} target="_blank" rel="noopener noreferrer">
                Program page.
              </a>
            </li>
            <li>
              For information on claiming an exemption from the carbon tax,
              please visit the{" "}
              <a
                href={carbonTaxExemptionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Carbon Tax Exemption page.
              </a>
            </li>
          </ul>
        </section>
        <section className="flex flex-col  bg-bc-bg-light-grey my-10 py-6 px-4">
          <h2 className={headerStyle}>Contact us</h2>
          <p>
            If you have any questions, please email us at <br />
            <a
              href="mailto:GHGRegulator@gov.bc.ca"
              className="text-black font-bold no-underline"
            >
              GHGRegulator@gov.bc.ca
            </a>
          </p>
        </section>
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
        <section className="flex flex-col ">
          <h2 className={`${headerStyle} w-full `}>
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
              className="border-none bg-transparent text-lg text-bc-link-blue cursor-pointer"
              onClick={handleBceidSignupClick}
            >
              Create one here
            </button>
          </p>
        </section>
        <h2 className={headerStyle}>Key Dates</h2>
        <table className={`table-auto w-full border-collapse ${tableBorder}`}>
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[70%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={`py-4 px-2 text-left ${tableBorder}`}>Date</th>
              <th className={`py-4 px-2 text-left ${tableBorder}`}>Event</th>
            </tr>
          </thead>
          <tbody>
            {events.map((row, index) => (
              <tr key={index}>
                <td className={`px-2 py-6 ${tableBorder} whitespace-pre-line`}>
                  {row.date}
                </td>
                <td className={`px-2 py-6 ${tableBorder} whitespace-pre-line`}>
                  {row.event}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <section className="flex flex-col  mt-8">
          <h2 className={`${headerStyle} w-full `}>
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
  );
}
