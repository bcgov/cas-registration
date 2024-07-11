import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const ActionCellFactory = ({
  generateHref,
  replace,
  className,
  cellText,
}: {
  generateHref: (params: GridRenderCellParams) => string;
  replace: boolean;
  className: string;
  cellText: string;
}) => {
  const renderCell = (params: GridRenderCellParams) => {
    return (
      <Link className={className} href={generateHref(params)} replace={replace}>
        {cellText}
      </Link>
    );
  };
  return renderCell;
};

export default ActionCellFactory;
