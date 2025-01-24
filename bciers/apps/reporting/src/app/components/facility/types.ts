export interface Product {
  allocated_quantity: number;
  report_product_id: number;
  product_name: string;
}

export interface EmissionAllocationData {
  emission_category: string;
  emission_total: number;
  category_type: string;
  products: Product[];
}
