import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles/colors";

// DataGrid component styles
const styles = {
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
  "& .MuiDataGrid-columnHeaders": {
    display: "flex",
    flexDirection: "column-reverse",
    // If column group headers are present, make the background white
    "& [role=row]:first-of-type:not(:only-child)": {
      "& .MuiDataGrid-columnHeader": {
        backgroundColor: "white",
        borderRight: "1px rgba(224, 224, 224, 1) solid",
        padding: 0,
        borderRadius: 0,
      },
      // Only show the search input's focus ring, not the whole header cell's
      "& .MuiDataGrid-columnHeader:focus-within:not(:focus)": {
        outline: "none",
      },
      "& .MuiDataGrid-columnHeader--last": {
        borderRight: "none",
      },
      "& .MuiDataGrid-columnHeader--emptyGroup": {
        borderBottom: "1px solid var(--DataGrid-rowBorderColor)",
      },
    },
    // Round the outer corners of the header row shown on top instead
    "& [role=row]:last-of-type": {
      "& [aria-colindex='1']": {
        borderTopLeftRadius: "calc(var(--unstable_DataGrid-radius) - 1px)",
      },
      "& .MuiDataGrid-columnHeader--last": {
        borderTopRightRadius: "calc(var(--unstable_DataGrid-radius) - 1px)",
      },
    },
  },
  // Header rows also hold filler elements, so :first/last-of-type don't match the edge cells
  "& .MuiDataGrid-columnHeader[aria-colindex='1']": {
    borderLeft: "none",
  },
  "& .MuiDataGrid-columnHeader--last": {
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
  "& .MuiDataGrid-cell, & .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell":
    {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      whiteSpace: "pre-line",
    },
  "& .MuiDataGrid-iconButtonContainer": {
    visibility: "visible !important",
    minWidth: "20px",
  },
  "& .MuiDataGrid-columnHeader .MuiDataGrid-sortButton": {
    backgroundColor: "transparent",
    // MUI's rule hiding unsorted buttons is more specific than this selector
    opacity: "1 !important",
    "& > *": {
      opacity: "1 !important",
    },
  },
  "& .MuiDataGrid-virtualScroller": {
    // Set min height to stop jumping effect when searching and no results are found.
    // The scroller also holds the column headers, so add their height to keep 40vh of rows
    minHeight: "calc(40vh + var(--DataGrid-headersTotalHeight))",
  },
};

export default styles;
