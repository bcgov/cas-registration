import {
  InternalFrontEndRoles,
  Status,
  UserOperatorStatus,
} from "@bciers/utils/src/enums";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { ButtonOwnProps } from "@mui/material/Button";
import { ReactNode } from "react";
import { UUID } from "crypto";

export interface InternalAccessRequestDataGridRow {
  id: UUID;
  name: string;
  role: InternalFrontEndRoles;
  email: string;
  status?: string | Status;
  archived_at?: string;
}

export interface InternalAccessRequestGridRenderCellParams
  extends GridRenderCellParams {
  row: InternalAccessRequestDataGridRow;
}

export interface InternalAccessRequestAction {
  title: string;
  color: ButtonOwnProps["color"];
  icon?: ReactNode;
  archive: boolean;
}

export interface InternalAccessRequest {
  id: UUID;
  name: string;
  role: InternalFrontEndRoles;
  email: string;
  archived_at?: string;
}

export interface UserOperatorDataGridRow {
  id: number;
  user_friendly_id: string;
  status: UserOperatorStatus;
  user__first_name: string;
  user__last_name: string;
  user__email: string;
  user__bceid_business_name: string;
  operator__legal_name: string;
}
