import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperationStatus } from "@bciers/utils/src/enums";

const OperationsActionCell = (isInternalUser: boolean) => {
  const renderCell = (params: GridRenderCellParams) => {
    let actionText = "View Operation";
    let url = `/administration/operations/${params.row.operation__id}?operations_title=${params.row.operation__name}`;
    if (!isInternalUser) {
      switch (params.row.operation__status) {
        case OperationStatus.NOT_STARTED:
          actionText = "Start Registration";
          url = "/registration/register-an-operation";
          break;
        case OperationStatus.DRAFT:
          actionText = "Continue Registration";
          url = `/registration/register-an-operation/${params.row.operation__id}/1`;
          break;
      }
    }
    return (
      <div>
        {/*To make external links (e.g., to a different module like registration) work, we have use <a> instead of <Link> */}
        <a className="action-cell-text" href={url}>
          {actionText}
        </a>
      </div>
    );
  };

  return renderCell;
};

export default OperationsActionCell;
