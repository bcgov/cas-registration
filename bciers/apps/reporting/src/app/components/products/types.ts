export interface Product {
  id: number;
  name: string;
  unit: string;
}

export interface ProductData {
  product_id: number;
  product_name: string;
  [key: string]: any;
}

export type ProductionDataFormPayload = {
  report_products: ProductData[];
  allowed_products: Product[];
  is_operation_opted_out: boolean;
};
