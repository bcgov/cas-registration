export interface ActivityDataChangeViewProps {
  activities: Record<string, any>;
  addedActivities?: any[];
  sourceTypeChanges?: SourceTypeChange[];
  modifiedActivities?: any[];
  deletedActivities?: any[];
}

export interface SourceTypeChange {
  activityName: string;
  sourceTypeName?: string;
  changeType?: "added" | "deleted" | "modified";
  fields?: any[];
}

export interface FieldChange {
  field: string;
  displayLabel: string;
  old_value: any;
  new_value: any;
  category: "unit" | "fuel" | "emission";
  fuelIndex?: number;
  emissionIndex?: number;
}

export interface SourceTypeChangeDetection {
  changeType: "added" | "deleted" | "modified" | null;
  changeData?: any;
}

export type ChangeType = "added" | "deleted" | "modified";
