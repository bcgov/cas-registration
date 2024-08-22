import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { OperationTypes } from "@bciers/utils/enums";

const OperationFacilitiesActionCell = () => {
  const renderCell = (params: GridRenderCellParams) => {
    const operationType = params.row.type;
    const isSfo = operationType === OperationTypes.SFO;
    const sfoFacilityId = params.row.sfo_facility_id;
    let actionText = "View Facilities";

    if (isSfo && !sfoFacilityId) {
      // Show edit details for SFO operations without a facility
      actionText = "Edit details";
    } else if (isSfo) {
      actionText = "View Facility";
    }

    // LFO sees the datagrid, SFO goes straight to the facility since there is only one
    const baseUrl = `operations/${params.row.id}/facilities`;
    const sfoUrl = `${baseUrl}/${sfoFacilityId ?? "add-facility"}`;

    const baseQuery = {
      operations_title: params.row.name,
    };

    const query = isSfo
      ? {
          ...baseQuery,
          facilities_title: params.row.name,
        }
      : baseQuery;

    return (
      <Link
        className="action-cell-text"
        href={{
          pathname: isSfo ? sfoUrl : baseUrl,
          query,
        }}
      >
        {actionText}
      </Link>
    );
  };

  return renderCell;
};

export default OperationFacilitiesActionCell;
