import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const OperatorsActionCell = () => {
  const renderCell = (params: GridRenderCellParams) => {
    const actionText = "View Details";
    return (
      <div>
        {/* 🔗 Add link with href query parameter with row's descriptive text*/}
        <Link
          className="action-cell-text"
          href={{
            // pathname: `operators/${params.row.id}`,
            // query: {
            //   operators_title: `${params.row.name}`,
            // },
            pathname: "tbd/for1699",
          }}
        >
          {actionText}
        </Link>
      </div>
    );
  };

  return renderCell;
};

export default OperatorsActionCell;
