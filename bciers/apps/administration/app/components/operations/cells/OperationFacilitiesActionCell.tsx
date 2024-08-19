import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperationTypes } from "@bciers/utils/enums";

const OperationFacilitiesActionCell = () => {
  const renderCell = (params: GridRenderCellParams) => {
    const operationType = params.row.type;
    const isSfo = operationType === OperationTypes.SFO;
    const actionText = isSfo ? "View Facility" : "View Facilities";
    const lfoUrl = `operations/${params.row.id}/facilities`;

    return (
      <div>
        {/* 🔗 Add link with href query parameter with row's descriptive text*/}
        <Link
          className="action-cell-text"
          href={{
            pathname: lfoUrl,
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

export default OperationFacilitiesActionCell;
