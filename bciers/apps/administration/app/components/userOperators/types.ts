import {
  OperatorStatus,
  Status,
  UserOperatorStatus,
} from "@bciers/utils/src/enums";
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
  street_address: string;
  municipality: string;
  province: string;
  postal_code: string;
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

export interface BusinessStructure {
  name: string;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  bceid_business_name: string;
  position_title: string;
  street_address: string;
  municipality: string;
  postal_code: string;
  email: string;
  phone_number: string;
  province: string;
  role: string;
  status: string;
}

interface ParentOperator {
  // PO = Parent Operator(Company)
  po_legal_name?: string;
  po_trade_name?: string;
  po_cra_business_number?: number;
  po_bc_corporate_registry_number?: string;
  po_business_structure?: string;
  po_website?: string;
  po_street_address?: string;
  po_municipality?: string;
  po_province?: string;
  po_postal_code?: string;
}
export interface UserOperatorFormData extends UserFormData {
  operator_status: OperatorStatus;
  is_senior_officer: string;
  legal_name: string;
  trade_name?: string;
  cra_business_number?: number;
  bc_corporate_registry_number?: string;
  business_structure: string;
  street_address: string;
  municipality: string;
  province: string;
  postal_code: string;
  website?: string;
  operator_has_parent_operators: boolean;
  parent_operators_array?: Array<ParentOperator>;
  // Not in form, but needed for API to create a contact based on the existing user-operator
  user_operator_id?: string;
  is_new: boolean;
  operator_id: number;
}
