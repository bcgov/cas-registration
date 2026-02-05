export interface OperationsSearchParams {
  [key: string]: string | number | undefined | boolean;
  bcghg_id?: string;
  name?: string;
  operator?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  type?: string;
  operator_id?: string;
}
