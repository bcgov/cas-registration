export interface ContactRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ContactsSearchParams {
  [key: string]: string | number | undefined;
  first_name?: string;
  last_name?: string;
  email?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
