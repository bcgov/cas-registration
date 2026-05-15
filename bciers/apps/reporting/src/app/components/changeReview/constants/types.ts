// Types for change review components

export type ChangeType = "added" | "deleted" | "modified" | "removed";

export type ChangeItemValue =
  | string
  | Record<string, any>
  | any[]
  | null
  | number;
export interface ChangeItem {
  field: string;
  field_display_title?: string;
  oldValue: ChangeItemValue;
  newValue: ChangeItemValue;
  change_type: ChangeType;
  displayLabel?: string;
  isNewAddition?: boolean;
  isDeleted?: boolean;
  facilityName?: any;
  deletedActivities?: any;
  subPath?: string[];
}

export interface ReviewChangesProps {
  changes: ChangeItem[];
  registrationPurpose: string;
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
