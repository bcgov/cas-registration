import { CheckboxRow } from "@bciers/components/datagrid/cells/types";

export interface FacilityReportSearchParams {
  [key: string]: string | number | undefined;
  facility_name?: string;
  facility_bcghgid?: string;
}

export interface FacilityRow extends CheckboxRow {
  id: string;
  facility: string;
  facility_bcghgid: string;
  facility_name: string;
}
