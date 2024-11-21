import { Status, UserOperatorStatus } from "@bciers/utils/src/enums";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { ButtonOwnProps } from "@mui/material/Button";
import { ReactNode } from "react";

export interface Operator {
  id: number;
  legal_name: string;
  trade_name: string;
  cra_business_number: string;
  bc_corporate_registry_number: string;
  business_structure: string;
  physical_street_address: string;
  physical_municipality: string;
  physical_province: string;
  physical_postal_code: string;
  mailing_street_address: string;
  mailing_municipality: string;
  mailing_province: string;
  mailing_postal_code: string;
  website: string;
  contacts: Array<number>;
}

export interface SelectOperatorFormData {
  search_type: string;
  legal_name?: string;
  cra_business_number?: number;
}

export interface AccessRequestDataGridRow {
  id: string;
  userFriendlyId: string;
  name: string;
  email: string;
  business: string;
  userRole: string;
  status: string | Status;
}

export interface AccessRequestGridRenderCellParams
  extends GridRenderCellParams {
  row: AccessRequestDataGridRow;
}

export interface AccessRequestStatusAction {
  statusTo: Status;
  title: string;
  color: ButtonOwnProps["color"];
  icon?: ReactNode;
}

export interface AccessRequest {
  id: string;
  user_friendly_id: string;
  role: string;
  status: string | Status;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    user_guid: string;
  };
  operator: {
    legal_name: string;
  };
}

export interface UserOperatorsSearchParams {
  [key: string]: string | number | undefined;
  sort_field?: string;
  sort_order?: string;
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
