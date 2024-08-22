import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperationStatus } from "@bciers/utils/enums";

const OperationsActionCell = () => {
  const renderCell = (params: GridRenderCellParams) => {
    let actionText;
    switch (params.row.status) {
      case OperationStatus.NOT_STARTED:
        actionText = "Start Registration";
        break;
      case OperationStatus.DRAFT:
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
            pathname: `operations/${params.row.id}`,
            query: {
              operations_title: `${params.row.name}`,
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

export default OperationsActionCell;
