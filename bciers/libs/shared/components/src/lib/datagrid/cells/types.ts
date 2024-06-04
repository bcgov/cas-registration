import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { Status } from "@/app/utils/enums";

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
