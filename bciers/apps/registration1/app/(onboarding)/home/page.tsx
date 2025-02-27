"use client";

// 🏷 import {named} can be significantly slower than import default
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid/Grid";
import events from "@/app/data/home/events.json";
import {
  bcObpsLink,
  bcObpsGuidanceLink,
  carbonTaxExemptionLink,
  ghgRegulatorEmail,
} from "@bciers/utils/src/urls";
import Note from "@bciers/components/layout/Note";
import Link from "next/link";
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
    <>
      <Note variant="important">
        <div className="mt-4">
          <b>Service Updates in Progress</b>
        </div>
        <div>
          BCIERS is currently undergoing scheduled updates until mid-March.
          During this time, user log-in will be temporarily unavailable. If you
          require urgent support, please reach out to{" "}
          <Link href={ghgRegulatorEmail}>GHGRegulator@gov.bc.ca</Link>.
        </div>
      </Note>
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
            <p>
              Welcome to the B.C. Industrial Emissions Reporting System
              (BCIERS), a web application for industrial operators to
              participate in the B.C. Output-Based Pricing System (B.C. OBPS).
            </p>

            <p>
              Operators who are eligible to participate in the B.C. OBPS will
              need to use this web application to start the registration
              process.
            </p>

            <p>
              Before getting started, take a moment to review the detailed{" "}
              <a
                href={bcObpsGuidanceLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                guidance
              </a>
              .
            </p>
            <p>
              BCIERS will enable operators to apply for a B.C. OBPS Regulated
              Operation ID (BORO ID) for each industrial operation that is
              eligible to participate in the B.C. OBPS. A BORO ID is needed to
              claim a carbon tax exemption under the Carbon Tax Act starting
              April 1, 2024.
            </p>
          </section>
          <section>
            <h2 className={headerStyle}>
              How to apply for a B.C. OBPS Regulated Operation ID
            </h2>
            <ol>
              <li>
                Log in as an industrial operator with your Business BCeID.
              </li>
              <li>Activate your industrial operator profile.</li>
              <li>
                Submit an application for each of your industrial operations.
              </li>
            </ol>
            <p>
              Upon review, each eligible industrial operation will receive a
              BORO ID.
            </p>
            <p>
              To check eligibility, and for further information about the B.C.
              OBPS, please visit the{" "}
              <a href={bcObpsLink} target="_blank" rel="noopener noreferrer">
                program website.
              </a>
            </p>
            <p>
              Please visit the{" "}
              <a
                href={carbonTaxExemptionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                carbon tax exemption
              </a>{" "}
              webpage to learn more about claiming an exemption from the carbon
              tax.
            </p>
          </section>
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
              disabled
              className="w-full md:max-w-[70%]"
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
                  <td
                    className={`px-2 py-6 ${tableBorder} whitespace-pre-line`}
                  >
                    {row.date}
                  </td>
                  <td className={`px-2 py-6 ${tableBorder}`}>{row.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <section className="flex flex-col items-center mt-8">
            <h2 className={`${headerStyle} w-full text-center`}>
              Log in as Government Employee
            </h2>
            <Button
              variant="outlined"
              className="w-full md:max-w-[70%]"
              disabled
            >
              Log in with IDIR
            </Button>
          </section>
        </Grid>
      </Grid>
    </>
  );
}
