import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const ActionCellFactory = ({
  generateHref,
  cellText,
  useWindowLocation = false,
}: {
  generateHref: (params: GridRenderCellParams) => string;
  cellText: string;
  useWindowLocation?: boolean;
}) => {
  const renderCell = (params: GridRenderCellParams) => {
    const href = generateHref(params);
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Use this to get around issues with shared datagrids and links to other apps/zones
      // ie registration app to administration app
      window.location.href = href;
    };
    return (
      <Link
        className="action-cell-text"
        onClick={useWindowLocation ? handleClick : undefined}
        href={href}
      >
        {cellText}
      </Link>
    );
  };
  return renderCell;
};

export default ActionCellFactory;
