import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const ActionCellFactory = ({
  generateHref,
  cellText,
}: {
  generateHref: (params: GridRenderCellParams) => string;
  cellText: string;
}) => {
  const renderCell = (params: GridRenderCellParams) => {
    return (
      <Link
        className="no-underline text-bc-link-blue whitespace-normal"
        href={generateHref(params)}
      >
        {cellText}
      </Link>
    );
  };
  return renderCell;
};

export default ActionCellFactory;
