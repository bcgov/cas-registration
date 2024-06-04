import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";

const EmptyGroupCell = (params: GridColumnGroupHeaderParams) => {
  const { headerName } = params;

  // This was needed to comply with the a11y accessibility rules
  return (
    <div
      aria-label={`${headerName} non-filterable column`}
      className="select-none"
    >
      N/A
    </div>
  );
};

export default EmptyGroupCell;
