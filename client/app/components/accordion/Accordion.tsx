"use client";

import { useEffect, useState } from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@/app/styles/colors";

interface Props {
  children: React.ReactNode;
  expanded?: boolean;
  title: string | React.ReactNode;
}

const Accordion = ({ children, expanded, title }: Props) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  return (
    <MuiAccordion
      disableGutters
      sx={{
        position: "initial",
      }}
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
    >
      <AccordionSummary
        expandIcon={
          <ArrowDropDownIcon
            sx={{
              color: "white",
              // expandIcon size is changed using fontSize
              fontSize: "48px",
            }}
          />
        }
        sx={{
          backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        {title}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          paddingY: "32px",
        }}
      >
        {children}
      </AccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;
