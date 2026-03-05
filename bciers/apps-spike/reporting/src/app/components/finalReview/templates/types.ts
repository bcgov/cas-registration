import { SourceTypeChange } from "@reporting/src/app/components/changeReview/constants/types";

export interface ActivityDataChangeViewProps {
  activities: Record<string, any>;
  addedActivities?: any[];
  sourceTypeChanges?: SourceTypeChange[];
  modifiedActivities?: any[];
  deletedActivities?: any[];
}

export interface FieldChange {
  field: string;
  displayLabel: string;
  oldValue: any;
  newValue: any;
  category: "unit" | "fuel" | "emission";
  fuelIndex?: number;
  emissionIndex?: number;
  changeType: ChangeType;
  isNewAddition?: boolean;
  isDeleted?: boolean;
}

export type ChangeType = "added" | "deleted" | "modified";

export interface Activity {
  changeType?: ChangeType;
  newValue?: {
    source_types?: SourceTypeChange;
  };
  oldValue?: {
    source_types?: SourceTypeChange;
  };
  activity?: string;
  sourceTypes?: SourceTypeChange;
}
