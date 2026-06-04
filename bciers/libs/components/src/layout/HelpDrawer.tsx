import { Button, Drawer, Link, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import {
  actLink,
  bcObpsGuidanceLink,
  bcObpsLink,
  boundaryMapGuidanceLink,
  ggerrLink,
  penaltiesRegulationLink,
  wciMethodologiesLink,
  complianceGuidanceLink,
} from "@bciers/utils/src/urls";

export default function HelpDrawer() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: 400, padding: "2rem" }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <div className="flex justify-between items-center">
        <h1 className={`w-full text-lg`}>Help</h1>
        <Link href="#" onClick={toggleDrawer(true)}>
          <CloseIcon />
        </Link>
      </div>

      <h4 className={`text-bc-bg-blue text-sm w-full`}>Getting Started</h4>
      <Link
        href={bcObpsLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>
            BC OBPS overview
          </h3>
          <p>
            See detailed explanations on getting started with the B.C.
            Output-Based Pricing System (OBPS).
          </p>
        </Box>
      </Link>

      <Link
        href={bcObpsGuidanceLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>
            Reporting Guidance
          </h3>
          <p>
            See detailed guidance for getting started and reporting. See a
            Glossary with explanations of terminology.
          </p>
        </Box>
      </Link>

      <Link
        href={complianceGuidanceLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>
            Compliance Guidance
          </h3>
          <p>
            See detailed guidance for meeting compliance obligations, making
            monetary payments, using compliance units, and general compliance
            information.
          </p>
        </Box>
      </Link>

      <h4 className={`text-bc-bg-blue text-sm w-full`}>
        Administration guidance
      </h4>
      <Link
        href={boundaryMapGuidanceLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>
            Process flow diagram and facility boundary map guidance
          </h3>
          <p>
            See detailed guidance on how to create Process Flow Diagrams and
            Facility Boundary Maps.
          </p>
        </Box>
      </Link>

      <h4 className={`text-bc-bg-blue text-sm w-full`}>Reporting guidance</h4>
      <Link
        href={wciMethodologiesLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>
            WCI methodologies
          </h3>
          <p>
            See detailed explanations of the Western Climate Initiative (WCI)
            methodologies for quantifying GHG emissions.
          </p>
        </Box>
      </Link>

      <h4 className={`text-bc-bg-blue text-sm w-full`}>Regulations and acts</h4>
      <Link
        href={actLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>GGIRCA</h3>
          <p>Greenhouse Gas Industrial Reporting and Control Act.</p>
        </Box>
      </Link>
      <Link
        href={ggerrLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>GGERR</h3>
          <p>Greenhouse Gas Emission Reporting Regulation.</p>
        </Box>
      </Link>
      <Link
        href={penaltiesRegulationLink}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: 1,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 className={`text-bc-bg-blue text-2xl w-full mt-0`}>GGEAPAR</h3>
          <p>
            Greenhouse Gas Emission Administrative Penalties and Appeals
            Regulation.
          </p>
        </Box>
      </Link>
    </Box>
  );

  return (
    <>
      <Link href="#" sx={{ color: "white", marginX: "2rem" }}>
        <Button
          aria-label="Help"
          color="inherit"
          variant="text"
          className="font-bold text-lg underline"
          onClick={toggleDrawer(true)}
        >
          Help
        </Button>
      </Link>
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
        {DrawerList}
      </Drawer>
    </>
  );
}
