// Types for change review components
import { Activity } from "@reporting/src/app/components/finalReview/templates/types";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";

export interface ChangeItem {
  facilityName?: any;
  deletedActivities?: any;
  field: string;
  oldValue: string | Record<string, any> | any[] | null | number;
  newValue: string | Record<string, any> | any[] | null | number;
  change_type: string;
  displayLabel?: string;
  isNewAddition?: boolean;
  isDeleted?: boolean;
}

export interface ReviewChangesProps {
  changes: ChangeItem[];
  flow: ReportingFlow;
  registrationPurpose: string;
}

export interface FacilityReportStructure {
  facilityNameChange: ChangeItem;
  facilityName: string;
  activities: Record<string, ActivityStructure>;
  emissionSummary: ChangeItem[];
  productionData: ChangeItem[];
  emissionAllocation: ChangeItem[];
  nonAttributableEmissions: ChangeItem[];
  isFacilityAdded?: boolean;
  isFacilityRemoved?: boolean;
  facilityData?: any;
}

export interface ActivityStructure {
  activityName: string;
  sourceTypes: Record<string, SourceTypeStructure>;
  changeType?: string;
  newValue?: any;
}

export interface SourceTypeStructure {
  sourceTypeName: string;
  fields: ChangeItem[];
  units: Record<number, UnitStructure>;
}

export interface UnitStructure {
  unitIndex: number;
  fields: ChangeItem[];
  fuels: Record<number, FuelStructure>;
  emissions: Record<number, EmissionStructure>;
}

export interface FuelStructure {
  fuelIndex: number;
  fields: ChangeItem[];
  emissions: Record<number, EmissionStructure>;
}

export interface EmissionStructure {
  emissionIndex: number;
  fields: ChangeItem[];
}

export interface DisplayChangeItem extends ChangeItem {
  displayLabel: string;
  isNewAddition?: boolean;
}

export interface EmissionAllocationChangeViewProps {
  data: ChangeItem[];
}

export interface ProcessedChange {
  categoryName: string;
  changes: DisplayChangeItem[];
}

export interface Product {
  report_product_id: number;
  product_name: string;
  allocated_quantity: string;
}

export interface ProductAllocationTotal {
  report_product_id: number;
  product_name: string;
  allocated_quantity: string;
}

export interface EmissionCategoryData {
  emission_category_name: string;
  emission_total: string;
  products: Product[];
}

export interface ActivityItem {
  activity: string;
  source_types?: Record<string, any>;
  [key: string]: any;
}
export interface SourceTypeChange {
  fields: string;
  facilityName: string;
  activityName: string;
  sourceTypeName: string;
  changeType: "added" | "deleted" | "modified";
  oldValue?: any;
  newValue?: any;
}
export interface ActivityRendererProps {
  activityName: string;
  activity: Activity;
  sourceTypeChangesForActivity: SourceTypeChange[];
  addedActivities?: Activity[];
  deletedActivities?: Activity[];
}
