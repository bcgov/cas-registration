export interface OperationRow {
  id: number;
  bcghg_id: string;
  name: string;
  operator: string;
  type: string;
}

export interface OperationsSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
  name?: string;
  operator?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  type?: string;
}
