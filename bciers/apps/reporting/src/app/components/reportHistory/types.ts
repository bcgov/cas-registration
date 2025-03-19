export interface OperationRow {
  id: number;
  bcghg_id: string;
  name: string;
  operator: string;
}
export interface OperationsSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
  name?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
