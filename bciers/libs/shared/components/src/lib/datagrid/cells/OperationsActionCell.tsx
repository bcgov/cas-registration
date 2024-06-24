import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperationStatus } from "@bciers/utils/server";

const OperationsActionCell = (isIndustryUser: boolean) => {
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
        actionText = "View Details";
    }

    return (
      <div>
        {/* 🔗 Add link with href query parameter with row's descriptive text*/}
        <Link
          className="no-underline text-bc-link-blue whitespace-normal"
          href={{
            pathname: `operations/${params.row.id}${
              isIndustryUser ? "/1" : ""
            }`,
            query: {
              title: `${params.row.name}`,
            },
          }}
          replace={true}
        >
          {actionText}
        </Link>
      </div>
    );
  };

  return renderCell;
};

export default OperationsActionCell;
