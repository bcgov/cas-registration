import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { Status } from "@bciers/utils/src/enums";
export interface CheckboxRow {
  id: string | number;
  is_completed: boolean;
}

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
