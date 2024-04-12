import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@/app/styles/colors";

// DataGrid component styles
const styles = {
  "& .MuiDataGrid-columnHeaderDraggableContainer": {
    minWidth: "100%",
  },
  "& .MuiDataGrid-row": {
    // Couldn't find a way to set minHeight without using !important
    // This was needed to use getRowHeight={() => "auto"} prop to break long text into multiple lines
    minHeight: "60px!important",
  },
  "& .MuiDataGrid-columnHeader": {
    border: "1px white solid",
    borderBottom: "none",
    borderTop: "none",
    color: "white",
    backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
    fontWeight: "bold",
    justifyContent: "center",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
    display: "flex",
    flexDirection: "column-reverse",
    // If column group headers are present, make the background white
    "& [role=row]:first-child:not(:only-child)": {
      "& .MuiDataGrid-columnHeader": {
        backgroundColor: "white",
        borderRight: "1px rgba(224, 224, 224, 1) solid",
        padding: 0,
      },
    },
  },
  "& .MuiDataGrid-columnHeader:first-of-type": {
    borderLeft: "none",
  },
  "& .MuiDataGrid-columnHeader:last-of-type": {
    borderRight: "none",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    justifyContent: "space-between",
    "& .MuiSvgIcon-root": {
      // Make the sort icon white in the title containers
      color: "white",
    },
  },
  "& .MuiDataGrid-columnHeaderTitleContainerContent": {
    flex: 1,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: "bold",
    whiteSpace: "pre-line",
    lineHeight: "normal",
    textAlign: "center",
    width: "100%",
    minWidth: "100%",
  },
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    whiteSpace: "pre-line",
  },
  ".MuiDataGrid-iconButtonContainer": {
    visibility: "visible !important",
    minWidth: "20px",
  },
  "& .MuiDataGrid-sortIcon": {
    opacity: "inherit !important",
  },
  "& .MuiDataGrid-filler": {
    display: "none",
  },
};

export default styles;
