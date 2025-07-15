// Types for change review components
export interface ChangeItem {
  facilityName: any;
  deletedActivities: any;
  field: string;
  old_value: string | Record<string, any> | null;
  new_value: string | Record<string, any> | null;
  change_type: string;
  displayLabel?: string;
  isNewAddition?: boolean;
}

export interface ReviewChangesProps {
  changes: ChangeItem[];
}

export interface FacilityReportStructure {
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
  new_value?: any;
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
