import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@/app/styles/colors";

interface Props {
  children: React.ReactNode;
  title: string | React.ReactNode;
}

const Accordion = ({ children, title }: Props) => {
  return (
    <MuiAccordion disableGutters>
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
      <AccordionDetails>{children}</AccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;
