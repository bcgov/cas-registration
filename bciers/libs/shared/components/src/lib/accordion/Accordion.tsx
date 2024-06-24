"use client";

import { useEffect, useState } from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles/colors";

interface Props {
  children: React.ReactNode;
  expanded?: boolean;
  expandedOptions?: { isExpandAll: boolean };
  title: string | React.ReactNode;
}

const Accordion = ({
  children,
  expanded = false,
  expandedOptions,
  title,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  useEffect(() => {
    // Update isExpanded state when isExpandAll prop changes
    // This is necessary to allow the parent component to control the expanded state
    // as well as to allow the user to control the expanded state
    const isExpandAll = expandedOptions?.isExpandAll;
    if (isExpandAll !== undefined) {
      setIsExpanded(isExpandAll);
    }
  }, [expandedOptions]);

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  return (
    <MuiAccordion
      disableGutters
      sx={{
        // This removes a small shadow that appears when the accordions are stacked
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
          paddingY: "16px",
        }}
      >
        {children}
      </AccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;
