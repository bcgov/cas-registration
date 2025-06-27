import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

/**
 * Props for the SimpleAccordion component.
 *
 * @property {React.ReactNode} title - The content to display in the accordion header.
 * @property {React.ReactNode} children - The content to display inside the expanded accordion.
 * @property {boolean} [defaultExpanded=true] - Whether the accordion is expanded by default.
 */
interface SimpleAccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandIcon = () => (
  <span className="text-2xl text-bc-bg-blue  group-hover:bg-bc-light-blue group-hover:rounded-full py-1 px-2">
    ▼
  </span>
);

const SimpleAccordion: React.FC<SimpleAccordionProps> = ({
  title,
  children,
  defaultExpanded = true,
}) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    elevation={0}
    className="shadow-none border-0 bg-transparent"
  >
    <AccordionSummary
      expandIcon={<ExpandIcon />}
      className="bg-transparent min-h-0 ps-0 pr-1 py-0 group cursor-pointer"
    >
      <div className="font-medium text-md text-bc-bg-blue">{title}</div>
    </AccordionSummary>
    <AccordionDetails className="p-0 bg-transparent">
      {children}
    </AccordionDetails>
  </Accordion>
);

export default SimpleAccordion;
