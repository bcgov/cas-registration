import {
  BC_GOV_BACKGROUND_COLOR_GREY,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  WHITE,
} from "@bciers/styles";

export const styles = {
  sourceCard: {
    backgroundColor: WHITE,
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  dataCard: {
    backgroundColor: BC_GOV_BACKGROUND_COLOR_GREY,
    padding: "12px",
    marginTop: "10px",
    borderRadius: "6px",
  },
};

export const verticalBorder = {
  borderLeft: `6px solid ${BC_GOV_PRIMARY_BRAND_COLOR_BLUE}`,
  marginLeft: "1rem",
  paddingLeft: "1rem",
  height: "50%",
  backgroundColor: "transparent",
  borderRadius: "7px",
};

export const collapseStyles = {
  marginLeft: "30px",
  marginRight: "30px",
  marginTop: "10px",
  marginBottom: "10px",
};

export const excludedKeys = ["units", "fuels", "emissions", "fuel type"];
