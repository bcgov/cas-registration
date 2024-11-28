import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperationStatus } from "@bciers/utils/src/enums";
import Link from "next/link";

const OperationsActionCell = (isInternalUser: boolean) => {
  const renderCell = (params: GridRenderCellParams) => {
    let actionText = "View Operation";
    let url = `/operations/${params.row.id}?operations_title=${params.row.name}`;
    if (!isInternalUser) {
      switch (params.row.status) {
        case OperationStatus.NOT_STARTED:
          actionText = "Start Registration";
          url = "../registration/register-an-operation";
          break;
        case OperationStatus.DRAFT:
          actionText = "Continue Registration";
          url = `../registration/register-an-operation/${params.row.id}/1`;
          break;
      }
    }
    return (
      <div>
        {/*To make external links (e.g., to a different module like registration) work, we have to passHref */}
        <Link className="action-cell-text" href={url} passHref={true}>
          {actionText}
        </Link>
      </div>
    );
  };

  return renderCell;
};

export default OperationsActionCell;
