import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { Status } from "@bciers/utils/src/enums";

export interface UserOperatorRenderCellParams extends GridRenderCellParams {
  row: {
    id: string;
    name: string;
    email: string;
    business: string;
    accessType: string;
    status: Status;
    actions: string;
  };
}
export interface FacilityRenderCellParams extends GridRenderCellParams {
  row: {
    id: string;
    report_status: string;
    status: Status;
    actions: string;
  };
}
