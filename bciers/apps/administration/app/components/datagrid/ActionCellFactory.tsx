import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const ActionCellFactory = ({
  generateHref,
  replace,
  cellText,
}: {
  generateHref: (params: GridRenderCellParams) => string;
  replace: boolean;
  cellText: string;
}) => {
  const renderCell = (params: GridRenderCellParams) => {
    return (
      <Link
        className="no-underline text-bc-link-blue whitespace-normal"
        href={generateHref(params)}
        replace={replace}
      >
        {cellText}
      </Link>
    );
  };
  return renderCell;
};

export default ActionCellFactory;
