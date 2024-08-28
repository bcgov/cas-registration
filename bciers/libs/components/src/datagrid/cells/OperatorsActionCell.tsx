import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperatorStatus } from "@bciers/utils/enums";

const OperatorsActionCell = () => {
  const renderCell = (params: GridRenderCellParams) => {
    let actionText;
    switch (params.row.status) {
      case OperatorStatus.DRAFT:
        actionText = "Continue";
        break;
      default:
        actionText = "View Operation";
    }
    return (
      <div>
        {/* 🔗 Add link with href query parameter with row's descriptive text*/}
        <Link
          className="action-cell-text"
          href={{
            pathname: `operators/${params.row.id}`,
            query: {
              operators_title: `${params.row.name}`,
            },
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
