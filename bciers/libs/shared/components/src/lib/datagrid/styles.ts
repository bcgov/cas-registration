import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles/colors";

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
  },
  "& .MuiDataGrid-columnHeadersInner": {
    flexDirection: "column-reverse",
  },
  "& .MuiDataGrid-columnHeaders": {
    display: "flex",
    // If column group headers are present, make the background white
    "& [role=row]:first-of-type:not(:only-child)": {
      "& .MuiDataGrid-columnHeader": {
        backgroundColor: "white",
        borderRight: "1px rgba(224, 224, 224, 1) solid",
        padding: 0,
      },
      "& .MuiDataGrid-columnHeader:last-of-type": {
        borderRight: "none",
      },
    },
  },
  "& .MuiDataGrid-columnHeader:first-of-type": {
    borderLeft: "none",
  },
  "& .MuiDataGrid-columnHeader:last-of-type": {
    borderRight: "none",
  },
  "& .MuiDataGrid-cell--withRightBorder:last-of-type": {
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
  "& .MuiDataGrid-virtualScroller": {
    // Set min height to stop jumping effect when searching and no results are found
    minHeight: "40vh",
  },
};

export default styles;
