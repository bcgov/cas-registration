"use client";

import { useEffect, useState } from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExpanded(isExpandAll);
    }
  }, [expandedOptions]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsExpanded(expanded);
  }, [expanded]);

  return (
    <MuiAccordion
      disableGutters
      className="static"
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
    >
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon className="text-white text-[48px]" />}
        className="bg-bc-bg-blue text-white text-[24px] font-bold"
      >
        {title}
      </AccordionSummary>
      <AccordionDetails className="py-4">{children}</AccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;
